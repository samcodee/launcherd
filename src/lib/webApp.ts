const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//
const HOST_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(?:[^@/?#]*@)?([^:/?#]+)/

export function extractHostname(rawUrl: string): string | null {
  const match = HOST_RE.exec(rawUrl)
  return match ? match[1].toLowerCase() : null
}

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const candidate = SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`
  const host = extractHostname(candidate)
  if (!host || (!host.includes('.') && host !== 'localhost')) return null
  return candidate
}

export function deriveDefaultPatterns(url: string): string[] {
  const host = extractHostname(url)
  if (!host) return []
  const bare = host.replace(/^www\./, '')
  return [`*${bare}`]
}

export function parsePatterns(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((pattern) => pattern.trim())
    .filter(Boolean)
}

function hostMatchesSuffix(host: string, suffix: string): boolean {
  return host === suffix || host.endsWith(`.${suffix}`)
}

function globPatternAllowed(rawUrl: string, host: string, pattern: string): boolean {
  const suffix = pattern.replace(/^\*/, '')
  if (!suffix.includes('*')) {
    const subdomainsOnly = suffix.startsWith('.')
    const bare = suffix.replace(/^\./, '').toLowerCase()
    if (!bare) return false
    if (subdomainsOnly) return host.endsWith(`.${bare}`)
    return hostMatchesSuffix(host, bare)
  }
  try {
    const source = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
    return new RegExp(source, 'i').test(rawUrl)
  } catch {
    return false
  }
}

export function isUrlAllowed(rawUrl: string, patterns: string[]): boolean {
  const host = extractHostname(rawUrl)
  if (!host) return false
  return patterns.some((raw) => {
    const pattern = raw.trim()
    if (!pattern) return false
    if (pattern === '*') return true
    const regexMatch = /^\/(.+)\/([a-z]*)$/i.exec(pattern)
    if (regexMatch) {
      try {
        return new RegExp(regexMatch[1], regexMatch[2]).test(rawUrl)
      } catch {
        return false
      }
    }
    if (pattern.includes('*')) {
      return globPatternAllowed(rawUrl, host, pattern)
    }
    return hostMatchesSuffix(host, pattern.toLowerCase())
  })
}

export function makeWebAppId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
