import { Resend } from "resend";
import twilio from "twilio";

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.EMAIL_FROM!;
  return resend.emails.send({
    from,
    to: params.to || process.env.EMAIL_TO_FALLBACK!,
    subject: params.subject,
    html: params.html,
  });
}

export async function sendSMS(params: { to: string; body: string }) {
  return twilioClient.messages.create({
    to: params.to,
    from: process.env.TWILIO_SMS_FROM!,
    body: params.body,
  });
}

export async function sendWhatsApp(params: { to: string; body: string }) {
  // to format: whatsapp:+91xxxxxxxxxx
  return twilioClient.messages.create({
    to: params.to.startsWith("whatsapp:")
      ? params.to
      : `whatsapp:${params.to}`,
    from: process.env.TWILIO_WHATSAPP_FROM!,
    body: params.body,
  });
}