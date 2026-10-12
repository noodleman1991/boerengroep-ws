'use client'

import { Button, useFormFields } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'
import { describeStatus, type NewsletterStatusData, type StatusLine } from '@sites/cms/newsletter-status'

type Loaded =
  | { state: 'checking' }
  | { state: 'hidden' }
  | { state: 'failed'; message: string }
  | { state: 'ready'; status: NewsletterStatusData }

const DOT: Record<StatusLine['tone'], string> = {
  good: '#2e9e44',
  attention: 'var(--theme-warning-500)',
  problem: 'var(--theme-error-500)',
  plain: 'var(--theme-elevation-300)',
}

/**
 * Shown at the top of Site settings, Newsletter. It answers one question for an editor:
 * does the sign-up box work, from the box on the site to our list in Brevo?
 */
export function NewsletterStatus() {
  const tenant = useFormFields(([fields]) => fields.tenant?.value)
  const [loaded, setLoaded] = useState<Loaded>({ state: 'checking' })

  const check = useCallback(async () => {
    setLoaded({ state: 'checking' })
    try {
      const query = typeof tenant === 'number' || typeof tenant === 'string' ? `?tenant=${encodeURIComponent(tenant)}` : ''
      const response = await fetch(`/api/newsletter/status${query}`, { credentials: 'include' })
      const body = await response.json().catch(() => null)
      if (response.ok && body?.otherSite) setLoaded({ state: 'hidden' })
      else if (response.ok && body?.key) setLoaded({ state: 'ready', status: body })
      else setLoaded({ state: 'failed', message: body?.error ?? 'The check did not work. Try again in a moment.' })
    } catch {
      setLoaded({ state: 'failed', message: 'The check did not work. Try again in a moment.' })
    }
  }, [tenant])

  useEffect(() => {
    void check()
  }, [check])

  if (loaded.state === 'hidden') return null

  const described = loaded.state === 'ready' ? describeStatus(loaded.status) : null

  return (
    <div
      style={{
        marginBottom: 'calc(var(--base) * 1.5)',
        padding: 'calc(var(--base) * 0.9) var(--base)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <h3 style={{ margin: '0 0 calc(var(--base) * 0.5)' }}>Does the sign-up box work?</h3>

      {loaded.state === 'checking' && <p style={{ margin: 0 }}>Checking the link with Brevo.</p>}
      {loaded.state === 'failed' && <p style={{ margin: 0 }}>{loaded.message}</p>}

      {described && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {described.lines.map((line) => (
            <li key={line.text} style={{ display: 'flex', gap: '0.6em', margin: '0.45em 0', alignItems: 'baseline' }}>
              <span
                aria-hidden="true"
                style={{ flex: 'none', width: '0.6em', height: '0.6em', borderRadius: '50%', background: DOT[line.tone] }}
              />
              <span>
                {line.tone === 'problem' || line.tone === 'attention' ? <strong>{line.text}</strong> : line.text}
                {line.detail && <span style={{ display: 'block', marginTop: '0.2em', opacity: 0.85 }}>{line.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {loaded.state !== 'checking' && (
        <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap', marginTop: 'calc(var(--base) * 0.5)' }}>
          <Button buttonStyle="secondary" size="small" onClick={() => void check()} margin={false}>
            Check again
          </Button>
        </div>
      )}
    </div>
  )
}
