'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Folder, Star, GitFork, Search, ExternalLink } from 'lucide-react'
import { playClick } from '@/lib/audio'

type Repo = {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
}

const LANG_COLORS: Record<string, string> = {
  python: '#00FF88',
  typescript: '#00D8FF',
  javascript: '#F59E0B',
  css: '#8B5CF6',
  html: '#EF4444',
  shell: '#E8593C',
}

function getLangColor(lang: string | null): string {
  if (!lang) return '#555'
  return LANG_COLORS[lang.toLowerCase()] ?? '#7A9BB5'
}

function getLangGlow(lang: string | null): string {
  if (!lang) return 'none'
  const c = LANG_COLORS[lang.toLowerCase()] ?? '#7A9BB5'
  return `0 0 6px ${c}80`
}

export default function GitHubRepos() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search to avoid filtering on every keystroke
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 200)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchRepos() {
      try {
        const res = await fetch(
          'https://api.github.com/users/DEVsaurabhgaur/repos?sort=updated&per_page=100',
          { next: { revalidate: 300 } } // cache for 5 min
        )
        if (!res.ok) throw new Error('Failed to retrieve GitHub repository array.')
        const data: unknown = await res.json()
        if (!cancelled) {
          if (Array.isArray(data)) {
            setRepos(data as Repo[])
          } else {
            throw new Error('Invalid registry data structure returned.')
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchRepos()
    return () => { cancelled = true }
  }, [])

  // Memoize filtered repos — only recomputes when repos or debouncedSearch changes
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return repos
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    )
  }, [repos, debouncedSearch])

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div className="relative max-w-md select-none">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-500/50">
          <Search size={14} />
        </span>
        <input
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="SEARCH LIVE REPOSITORY ARCHIVES..."
          className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded outline-none text-xs font-mono tracking-widest text-cyan-400 placeholder-slate-600 focus:border-cyan-500/40 transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
          aria-label="Search repositories"
        />
      </div>

      {loading && (
        <div className="py-24 text-center space-y-3 select-none">
          <div className="inline-block w-8 h-8 border-2 rounded-full border-t-cyan-400 border-slate-800 animate-spin" />
          <p className="text-xs font-mono text-cyan-400/80 tracking-widest">// SYNCHRONIZING REPOSITORY INVENTORY...</p>
        </div>
      )}

      {error && (
        <div className="py-16 text-center border border-rose-500/20 bg-rose-950/10 rounded-lg max-w-xl mx-auto select-none">
          <p className="text-xs font-mono text-rose-500 tracking-widest mb-2">{'>>'} LINK STATE FAILURE :: OFFLINE or UNRESOLVED</p>
          <p className="text-xs text-slate-400">Could not fetch live GitHub repositories. Verify connection parameters.</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-slate-500 text-xs font-mono tracking-wider select-none">
          NO MATCHING INVENTORY CODES FOUND.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block card p-5 relative overflow-hidden transition-all duration-300 clip-cyber-sm border border-slate-850 hover:border-cyan-500/30 bg-[#090f16]/40 cyber-card-scanner"
              onMouseEnter={playClick}
            >
              {/* Shine overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.03) 0%, transparent 60%)' }} />

              <div className="flex items-start justify-between mb-4">
                <span className="p-2 rounded bg-cyan-950/20 border border-cyan-500/10 text-cyan-400 group-hover:text-white group-hover:border-cyan-500/30 transition-all duration-200">
                  <Folder size={16} />
                </span>
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <ExternalLink size={14} />
                </span>
              </div>

              <h3 className="text-sm font-semibold font-mono tracking-wide mb-2 truncate text-slate-200 group-hover:text-cyan-400 transition-colors">
                {repo.name}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8" style={{ lineHeight: '1.6' }}>
                {repo.description || 'No module description registered.'}
              </p>

              <div className="flex items-center gap-4 pt-3.5 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: getLangColor(repo.language),
                        boxShadow: getLangGlow(repo.language),
                      }}
                    />
                    <span style={{ color: getLangColor(repo.language) }}>{repo.language}</span>
                  </span>
                )}
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={10} className="text-amber-500" />
                    {repo.stargazers_count}
                  </span>
                )}
                {repo.forks_count > 0 && (
                  <span className="flex items-center gap-1">
                    <GitFork size={10} />
                    {repo.forks_count}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
