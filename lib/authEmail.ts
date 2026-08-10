import { createTransport } from 'nodemailer';
import type { EmailConfig } from 'next-auth/providers/email';

// Hand-built magic-link email matching the app's "Midnight" floating-card
// look (docs/UI-SPEC.md v4) — email clients can't read CSS custom
// properties, so the light-theme hex values from app/globals.css are
// inlined directly.
const COLORS = {
  bg: '#f2f4f9',
  surface: '#ffffff',
  surface2: '#eaeef5',
  textPrimary: '#12141a',
  textMuted: '#62666f',
  textSubtle: '#9297a1',
  border: '#e1e5ee',
  accent: '#2563eb',
  accentFg: '#ffffff',
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}

function buildHtml(url: string, email: string) {
  const safeUrl = escapeHtml(url);
  const safeEmail = escapeHtml(email);
  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:${COLORS.bg}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg}; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="420" cellpadding="0" cellspacing="0" style="max-width:420px; width:100%; background:${COLORS.surface}; border-radius:24px; box-shadow:0 8px 30px rgba(15,23,42,0.09); border:1px solid ${COLORS.border};">
            <tr>
              <td style="padding:40px 32px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px; height:40px; border-radius:9999px; background:${COLORS.accent}; color:${COLORS.accentFg}; font-family:'Courier New',monospace; font-size:13px; font-weight:700; text-align:center; vertical-align:middle;">
                      CS
                    </td>
                  </tr>
                </table>

                <h1 style="margin:24px 0 8px; font-size:22px; line-height:1.3; font-weight:700; color:${COLORS.textPrimary};">
                  Sign in to CS Resource Hub
                </h1>
                <p style="margin:0 0 28px; font-size:14px; line-height:1.6; color:${COLORS.textMuted};">
                  Use the button below to sign in as <strong style="color:${COLORS.textPrimary};">${safeEmail}</strong>.
                  This link expires in 10 minutes and can only be used once.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:9999px; background:${COLORS.accent};">
                      <a href="${safeUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:14px; font-weight:600; color:${COLORS.accentFg}; text-decoration:none; border-radius:9999px;">
                        Sign in
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 0; font-size:12px; line-height:1.6; color:${COLORS.textSubtle};">
                  Button not working? Copy and paste this link into your browser:<br />
                  <a href="${safeUrl}" style="color:${COLORS.textMuted}; word-break:break-all;">${safeUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid ${COLORS.border}; background:${COLORS.surface2}; border-radius:0 0 24px 24px;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:${COLORS.textSubtle};">
                  KNUST Computer Science Department · If you didn&rsquo;t request this, you can
                  safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText(url: string, email: string) {
  return `Sign in to CS Resource Hub

Use this link to sign in as ${email}. It expires in 10 minutes and can only be used once:

${url}

If you didn't request this, you can safely ignore this email.
KNUST Computer Science Department`;
}

export async function sendVerificationRequest(params: Parameters<NonNullable<EmailConfig['sendVerificationRequest']>>[0]) {
  const { identifier: email, url, provider } = params;
  const transport = createTransport(provider.server);
  await transport.sendMail({
    to: email,
    from: provider.from,
    subject: 'Sign in to CS Resource Hub',
    text: buildText(url, email),
    html: buildHtml(url, email),
  });
}
