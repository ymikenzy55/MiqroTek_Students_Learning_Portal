/**
 * Brevo (Sendinblue) transactional email helper.
 * Uses the Brevo v3 SMTP API to send emails without requiring an SDK.
 *
 * Required env vars:
 *   BREVO_API_KEY  — Brevo API key (starts with xkeysib-)
 *   BREVO_FROM_EMAIL — sender email (must be verified in Brevo)
 *   BREVO_FROM_NAME  — sender display name
 */

interface BrevoEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({ to, subject, htmlContent }: BrevoEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL || "no-reply@miqrotek.com";
  const fromName = process.env.BREVO_FROM_NAME || "Miqrotek";

  if (!apiKey) {
    console.warn("⚠️ BREVO_API_KEY is not set — email will not be sent.");
    return false;
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: fromName },
        to,
        subject,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Brevo API error:", res.status, errText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to send email via Brevo:", error);
    return false;
  }
}

/** Send a password reset email with a clickable button. */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color:#4f46e5;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Miqrotek</p>
              <p style="margin:4px 0 0;color:#c7d2fe;font-size:12px;">Student Learning Portal</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#1a1a1a;">Reset your password</h1>
              <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.6;">
                Hi ${name},
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
                We received a request to reset your Miqrotek account password. Click the button below
                to choose a new password. This link will expire in 1 hour.
              </p>
              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background-color:#4f46e5;border-radius:8px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;color:#888888;line-height:1.6;">
                If the button doesn&apos;t work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#4f46e5;word-break:break-all;">
                ${resetUrl}
              </p>
              <p style="margin:0;font-size:14px;color:#555555;line-height:1.6;">
                If you didn&apos;t request a password reset, you can safely ignore this email — your
                password will not be changed.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                &copy; ${new Date().getFullYear()} Miqrotek. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: [{ email, name }],
    subject: "Reset your Miqrotek password",
    htmlContent: html,
  });
}

/** Send a welcome email after successful registration. */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const loginUrl = `${process.env.NEXTAUTH_URL || "https://miqrotek.vercel.app"}/login`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color:#4f46e5;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Miqrotek</p>
              <p style="margin:4px 0 0;color:#c7d2fe;font-size:12px;">Student Learning Portal</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">Welcome to Miqrotek! 🎉</h1>
              <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.6;">
                Hi ${name},
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
                Your account has been created successfully. You can now enroll in courses, track your
                progress, and start your learning journey with us.
              </p>
              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background-color:#4f46e5;border-radius:8px;">
                    <a href="${loginUrl}" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                      Sign In to Your Account
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;color:#555555;line-height:1.6;">
                Here&apos;s what you can do next:
              </p>
              <ul style="margin:0 0 24px;padding-left:24px;font-size:14px;color:#555555;line-height:1.8;">
                <li>Browse available courses and enroll</li>
                <li>Track your attendance and progress</li>
                <li>Message your instructors directly</li>
                <li>Access course materials and weekly topics</li>
              </ul>
              <p style="margin:0;font-size:14px;color:#555555;line-height:1.6;">
                If you have any questions, feel free to reach out to your instructor through the
                messaging feature once you&apos;re logged in.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                &copy; ${new Date().getFullYear()} Miqrotek. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: [{ email, name }],
    subject: "Welcome to Miqrotek! 🎉",
    htmlContent: html,
  });
}
