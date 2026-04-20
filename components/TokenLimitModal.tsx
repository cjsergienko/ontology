'use client'

import { useState } from 'react'
import { XIcon, SendIcon, CheckCircleIcon } from 'lucide-react'

interface Props {
  onClose: () => void
}

export function TokenLimitModal({ onClose }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
    } catch {
      setError('Could not send your message. Please email contact@ontology.live directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(7,11,20,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-xl w-full max-w-md animate-fade-in"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
                Free AI quota reached
              </h2>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              You&apos;ve used your free 3,000 output token allowance. Send us a message and we&apos;ll extend your access.
            </p>
          </div>
          <button onClick={onClose} className="ml-4 shrink-0" style={{ color: 'var(--text-dim)' }}>
            <XIcon size={16} />
          </button>
        </div>

        <div
          className="mx-7 mb-5"
          style={{ height: 1, background: 'var(--border)' }}
        />

        <div className="px-7 pb-7">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircleIcon size={32} style={{ color: '#10b981' }} />
              <p className="text-sm font-medium text-center" style={{ color: 'var(--text)' }}>
                Message sent — we&apos;ll be in touch soon.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded text-sm font-medium"
                style={{ background: 'var(--accent)', color: '#000' }}
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Your message
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Briefly describe your use case or research project…"
                  rows={4}
                  className="w-full rounded-lg px-3 py-2.5 text-sm resize-none outline-none transition-colors"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    lineHeight: 1.6,
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded text-sm"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={!message.trim() || loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-opacity"
                  style={{
                    background: !message.trim() || loading ? 'var(--surface2)' : 'var(--accent)',
                    color: !message.trim() || loading ? 'var(--text-muted)' : '#000',
                    border: '1px solid transparent',
                    opacity: !message.trim() ? 0.4 : 1,
                  }}
                >
                  {loading ? (
                    <span
                      className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                    />
                  ) : (
                    <>
                      <SendIcon size={13} />
                      Send request
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>
                Or email us directly at{' '}
                <a href="mailto:contact@ontology.live" style={{ color: 'var(--accent)' }}>
                  contact@ontology.live
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
