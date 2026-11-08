import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing email over SMTP. Works with Gmail (default host) or any provider:
 *   SMTP_USER / SMTP_PASS  – required (for Gmail: the address + an App Password)
 *   SMTP_HOST / SMTP_PORT  – optional, default smtp.gmail.com:465
 *   EMAIL_FROM             – optional, default "Aldar Restaurant <SMTP_USER>"
 * When SMTP_USER / SMTP_PASS are missing, emails are skipped (not an error).
 */

let transporter: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    let pass = process.env.SMTP_PASS ?? "";
    // Google shows App Passwords as "abcd efgh ijkl mnop"; the spaces are not part of it.
    if (host === "smtp.gmail.com") pass = pass.replace(/\s+/g, "");

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass },
      // Fail fast instead of hanging the serverless function.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Sends the email. `previewUrl` is set only when using Ethereal
 * (smtp.ethereal.email), a fake SMTP service for testing: messages are not
 * delivered to real inboxes but can be viewed at that URL.
 */
export async function sendEmail(message: EmailMessage) {
  const from =
    process.env.EMAIL_FROM?.trim() ||
    `"Aldar Restaurant" <${process.env.SMTP_USER}>`;
  const info = await getTransporter().sendMail({ from, ...message });
  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
  return { messageId: info.messageId, previewUrl };
}
