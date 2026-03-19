import { createTransport } from 'nodemailer'

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'ssergienko@pivotsdoo.com'
const FROM = 'ontology.live <contact@ontology.live>'

function getTransport() {
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    // Resend SMTP — works with any domain, no server config needed
    return createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: { user: 'resend', pass: apiKey },
    })
  }
  // Fallback: generic SMTP (Gmail app password, etc.)
  if (process.env.SMTP_HOST) {
    return createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  // Local sendmail — only works if postfix is properly relayed
  return createTransport({ sendmail: true })
}

export async function sendRegistrationEmail(userEmail: string, userName: string) {
  try {
    const transport = getTransport()
    await transport.sendMail({
      from: FROM,
      to: NOTIFY_EMAIL,
      subject: `New user signed up: ${userEmail}`,
      text: [
        `New user registered on ontology.live`,
        ``,
        `Name:  ${userName || '(no name)'}`,
        `Email: ${userEmail}`,
        `Time:  ${new Date().toISOString()}`,
        `Plan:  free`,
      ].join('\n'),
    })
    console.log(`[notify] registration email sent for ${userEmail}`)
  } catch (err) {
    // Non-fatal — don't block sign-in if email fails
    console.error('[notify] registration email failed:', err)
  }
}
