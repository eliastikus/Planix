import { useEffect, useState } from 'react'

type Health = { ok: boolean; service?: string }

export function BackendStatus() {
  const [data, setData] = useState<Health | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json() as Promise<Health>
      })
      .then(setData)
      .catch(() => setErr('unreachable'))
  }, [])

  if (err) {
    return (
      <p className="backend-status backend-status--error">
        API: offline — run <code>npm run dev</code> from the repo root (starts
        client + server)
      </p>
    )
  }
  if (!data) return <p className="backend-status">API: connecting…</p>
  return (
    <p className="backend-status backend-status--ok">
      API: {data.service ?? 'ready'}
    </p>
  )
}
