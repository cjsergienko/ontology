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

function buildHtml(userEmail: string, userName: string): string {
  const time = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  const initial = (userName || userEmail)[0].toUpperCase()

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070b14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#070b14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="padding-bottom:28px;" align="center">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <span style="font-size:22px;font-weight:800;color:#f1f5f9;letter-spacing:-0.02em;">ontology<span style="color:#6366f1;">.</span>live</span>
          </div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#0d1224;border:1px solid #1e2a4a;border-radius:12px;padding:32px;">

          <!-- Icon + title -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="44" valign="middle">
                <div style="width:40px;height:40px;border-radius:50%;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);display:flex;align-items:center;justify-content:center;text-align:center;line-height:40px;font-size:18px;">🎉</div>
              </td>
              <td valign="middle" style="padding-left:14px;">
                <div style="font-size:18px;font-weight:700;color:#f1f5f9;letter-spacing:-0.01em;">New user signed up</div>
                <div style="font-size:12px;color:#475569;margin-top:2px;">${time}</div>
              </td>
            </tr>
          </table>

          <!-- Divider -->
          <div style="height:1px;background:#1e2a4a;margin-bottom:24px;"></div>

          <!-- User row -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="48" valign="top">
                <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);text-align:center;line-height:44px;font-size:18px;font-weight:700;color:#fff;">${initial}</div>
              </td>
              <td valign="top" style="padding-left:14px;">
                <div style="font-size:15px;font-weight:600;color:#f1f5f9;">${userName || '(no name)'}</div>
                <div style="font-size:13px;color:#6366f1;margin-top:3px;">${userEmail}</div>
              </td>
            </tr>
          </table>

          <!-- Stats pills -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding-right:8px;">
                <span style="display:inline-block;padding:5px 12px;border-radius:9999px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);font-size:12px;color:#818cf8;font-weight:600;">FREE plan</span>
              </td>
              <td>
                <span style="display:inline-block;padding:5px 12px;border-radius:9999px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);font-size:12px;color:#10b981;font-weight:600;">Demo ontology seeded</span>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="https://ontology.live/dashboard" style="display:inline-block;padding:11px 28px;border-radius:8px;background:#6366f1;color:#fff;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.01em;">View Dashboard →</a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:20px;" align="center">
          <div style="font-size:11px;color:#334155;">ontology.live &nbsp;·&nbsp; contact@ontology.live</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function gmailSend(
  accessToken: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
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

function buildContactHtml(userEmail: string, userName: string, message: string): string {
  const time = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  const initial = (userName || userEmail)[0].toUpperCase()
  const escapedMessage = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070b14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#070b14;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:28px;" align="center">
          <span style="font-size:22px;font-weight:800;color:#f1f5f9;letter-spacing:-0.02em;">ontology<span style="color:#6366f1;">.</span>live</span>
        </td></tr>
        <tr><td style="background:#0d1224;border:1px solid #1e2a4a;border-radius:12px;padding:32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="44" valign="middle">
                <div style="width:40px;height:40px;border-radius:50%;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);text-align:center;line-height:40px;font-size:18px;">✉️</div>
              </td>
              <td valign="middle" style="padding-left:14px;">
                <div style="font-size:18px;font-weight:700;color:#f1f5f9;">Token limit contact request</div>
                <div style="font-size:12px;color:#475569;margin-top:2px;">${time}</div>
              </td>
            </tr>
          </table>
          <div style="height:1px;background:#1e2a4a;margin-bottom:24px;"></div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="48" valign="top">
                <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);text-align:center;line-height:44px;font-size:18px;font-weight:700;color:#fff;">${initial}</div>
              </td>
              <td valign="top" style="padding-left:14px;">
                <div style="font-size:15px;font-weight:600;color:#f1f5f9;">${userName || '(no name)'}</div>
                <div style="font-size:13px;color:#6366f1;margin-top:3px;">${userEmail}</div>
              </td>
            </tr>
          </table>
          <div style="background:#070b14;border:1px solid #1e2a4a;border-radius:8px;padding:16px;font-size:14px;color:#cbd5e1;line-height:1.6;">${escapedMessage}</div>
        </td></tr>
        <tr><td style="padding-top:20px;" align="center">
          <div style="font-size:11px;color:#334155;">ontology.live &nbsp;·&nbsp; contact@ontology.live</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendContactEmail(userEmail: string, userName: string, message: string) {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH) || !fs.existsSync(TOKEN_PATH)) {
      console.warn('[notify] Gmail config not found — skipping contact email')
      return
    }
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'))
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'))
    const { client_id, client_secret } = credentials.installed ?? credentials.web ?? {}
    const accessToken = await refreshAccessToken(token.refresh_token, client_id, client_secret)
    await gmailSend(
      accessToken,
      'contact@ontology.live',
      `Token limit request from ${userEmail}`,
      buildContactHtml(userEmail, userName, message),
    )
    console.log(`[notify] contact email sent for ${userEmail}`)
  } catch (err) {
    console.error('[notify] contact email failed:', err)
  }
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
      buildHtml(userEmail, userName),
    )

    console.log(`[notify] registration email sent for ${userEmail}`)
  } catch (err) {
    console.error('[notify] registration email failed:', err)
  }
}
