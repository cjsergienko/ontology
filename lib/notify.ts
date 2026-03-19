import fs from 'fs'
import path from 'path'

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'ssergienko@pivotsdoo.com'

const CREDENTIALS_PATH = path.join(process.cwd(), 'config', 'gmail-credentials.json')
const TOKEN_PATH = path.join(process.cwd(), 'config', 'gmail-token-ssergienko.json')

async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`)
  const data = await res.json()
  return data.access_token
}

async function gmailSend(
  accessToken: string,
  to: string,
  subject: string,
  text: string,
): Promise<void> {
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    text,
  ]
  const encoded = Buffer.from(emailLines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: encoded }),
  })
  if (!res.ok) throw new Error(`Gmail send failed: ${await res.text()}`)
}

export async function sendRegistrationEmail(userEmail: string, userName: string) {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH) || !fs.existsSync(TOKEN_PATH)) {
      console.warn('[notify] Gmail config not found — skipping registration email')
      return
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'))
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'))
    const { client_id, client_secret } = credentials.installed ?? credentials.web ?? {}

    const accessToken = await refreshAccessToken(token.refresh_token, client_id, client_secret)

    await gmailSend(
      accessToken,
      NOTIFY_EMAIL,
      `New user signed up: ${userEmail}`,
      [
        'New user registered on ontology.live',
        '',
        `Name:  ${userName || '(no name)'}`,
        `Email: ${userEmail}`,
        `Time:  ${new Date().toISOString()}`,
        `Plan:  free`,
      ].join('\n'),
    )

    console.log(`[notify] registration email sent for ${userEmail}`)
  } catch (err) {
    console.error('[notify] registration email failed:', err)
  }
}
