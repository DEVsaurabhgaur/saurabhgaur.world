import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { items, buyer_email } = await req.json()

    if (!items?.length || !buyer_email) {
      return NextResponse.json({ error: 'Missing items or email' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(buyer_email)) || String(buyer_email).length > 254) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Prevent oversized cart abuse
    if (!Array.isArray(items) || items.length > 50) {
      return NextResponse.json({ error: 'Cart size limit exceeded' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Validate products + fetch server-side prices (never trust client prices)
    const productIds = items.map((i: { product_id: string }) => i.product_id)
    const { data: products, error } = await supabase
      .from('art_products')
      .select('id, price_inr, is_published')
      .in('id', productIds)

    if (error || !products?.length) {
      return NextResponse.json({ error: 'Products not found' }, { status: 404 })
    }

    // Only allow published products
    const unpublished = products.filter((p) => !p.is_published)
    if (unpublished.length) {
      return NextResponse.json({ error: 'Some products are unavailable' }, { status: 400 })
    }

    // Compute total from server-side prices
    const total = products.reduce((sum, p) => sum + p.price_inr, 0)

    // Create Razorpay order
    const rzOrder = await razorpay.orders.create({
      amount: total, // already in paise
      currency: 'INR',
      receipt: `sg_${Date.now()}`,
      notes: { buyer_email },
    })

    // Persist pending order in DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_email,
        razorpay_order_id: rzOrder.id,
        razorpay_payment_id: null,
        amount_inr: total,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order record' }, { status: 500 })
    }

    // Persist order items
    const orderItems = products.map((p) => ({
      order_id: order.id,
      product_id: p.id,
      price_at_purchase: p.price_inr,
    }))
    await supabase.from('order_items').insert(orderItems)

    return NextResponse.json({
      razorpay_order_id: rzOrder.id,
      amount: total,
      order_id: order.id,
    })
  } catch (err) {
    console.error('[create-order]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
