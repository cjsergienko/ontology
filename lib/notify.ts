import { createTransport } from 'nodemailer'

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'ssergienko@pivotsdoo.com'

function getTransport() {
  // Uses sendmail on the server — no external SMTP needed on Mac Mini
  return createTransport({ sendmail: true })
}

export async function sendRegistrationEmail(userEmail: string, userName: string) {
  try {
    const transport = getTransport()
    await transport.sendMail({
      from: 'ontology.live <noreply@ontology.live>',
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
  } catch (err) {
    // Non-fatal — don't block sign-in if email fails
    console.error('[notify] registration email failed:', err)
  }
}
