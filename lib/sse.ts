const enc = new TextEncoder()

/** Wraps an async task in a Server-Sent Events stream.
 *  Sends keepalive pings every 8s so Cloudflare (100s timeout) never kills the connection.
 *  Sends `data: {"result": ...}` on success or `data: {"error": "..."}` on failure.
 */
export function sseStream(task: () => Promise<object>): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const ping = setInterval(() => {
        try { controller.enqueue(enc.encode('data: {"status":"processing"}\n\n')) } catch {}
      }, 8_000)

      try {
        const result = await task()
        clearInterval(ping)
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ result })}\n\n`))
      } catch (err) {
        clearInterval(ping)
        const message = err instanceof Error ? err.message : String(err)
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: message })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no', // disable proxy buffering (nginx, Cloudflare)
    },
  })
}

/** Client-side: reads an SSE stream until it gets a result or error event. */
export async function readSSE(resp: Response): Promise<object> {
  if (!resp.body) throw new Error('No response body')
  const reader = resp.body.getReader()
  const dec = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) throw new Error('Stream closed without a result')

    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (!payload || payload === '{"status":"processing"}') continue
      const data = JSON.parse(payload) as { result?: object; error?: string }
      if (data.error) throw new Error(data.error)
      if (data.result) return data.result
    }
  }
}
