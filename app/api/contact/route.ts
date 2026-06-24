import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL } from '@/lib/resend'

// Simple in-memory rate limit: max 3 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const WINDOW = 10 * 60 * 1000 // 10 minutes
  const MAX_REQUESTS = 3

  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW })
    return false
  }
  if (entry.count >= MAX_REQUESTS) return true
  entry.count++
  return false
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

function sanitizeText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export async function POST(req: NextRequest) {
  const ip = getRateLimitKey(req)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before sending another message.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    // Input validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid field types' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (name.length > 100 || message.length > 5000) {
      return NextResponse.json({ error: 'Input exceeds maximum length' }, { status: 400 })
    }

    // Sanitize all fields before inserting into HTML
    const safeName = sanitizeText(name.trim())
    const safeEmail = sanitizeText(email.trim())
    const safeSubject = subject ? sanitizeText(String(subject).trim().slice(0, 200)) : ''
    const safeMessage = sanitizeText(message.trim())

    await resend.emails.send({
      from: FROM_EMAIL,
      to: 'saurabhgaur122000@gmail.com',
      reply_to: email.trim(),
      subject: safeSubject ? `[Contact] ${safeSubject}` : `[Contact] Message from ${safeName}`,
      html: `
        <div style="background:#0A0A0A;padding:40px;font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#F0F0F0;font-size:20px;margin-bottom:16px">New contact message</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;font-size:13px;width:80px">From</td>
                <td style="padding:6px 0;color:#F0F0F0;font-size:13px">${safeName} &lt;${safeEmail}&gt;</td></tr>
            ${safeSubject ? `<tr><td style="padding:6px 0;color:#888;font-size:13px">Subject</td>
                <td style="padding:6px 0;color:#F0F0F0;font-size:13px">${safeSubject}</td></tr>` : ''}
          </table>
          <hr style="border:none;border-top:1px solid #222;margin:20px 0" />
          <p style="color:#F0F0F0;font-size:14px;line-height:1.7;white-space:pre-wrap">${safeMessage}</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
