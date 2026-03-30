import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactRequestBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const DEFAULT_CONTACT_TO = "jasond.worked@gmail.com";
const DEFAULT_SMTP_USER = "jasond.portfolio2026@gmail.com";

function toTrimmedText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequestBody;
    const name = toTrimmedText(body.name);
    const email = toTrimmedText(body.email);
    const subject = toTrimmedText(body.subject);
    const message = toTrimmedText(body.message);

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const smtpUser = process.env.CONTACT_SMTP_USER ?? DEFAULT_SMTP_USER;
    const smtpPassword = process.env.CONTACT_SMTP_APP_PASSWORD;
    const contactTo = process.env.CONTACT_EMAIL_TO ?? DEFAULT_CONTACT_TO;
    const fromName = process.env.CONTACT_EMAIL_FROM_NAME ?? "Jasond Portfolio";

    if (!smtpUser || !smtpPassword || !contactTo) {
      return NextResponse.json(
        { error: "Contact email is not configured on the server." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const textBody = [
      `From: ${email}`,
      name ? `Name: ${name}` : null,
      "",
      "Message:",
      message,
    ]
      .filter((item): item is string => Boolean(item))
      .join("\n");

    await transporter.sendMail({
      from: `${fromName} <${smtpUser}>`,
      to: contactTo,
      replyTo: email,
      subject,
      text: textBody,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to send message right now." },
      { status: 500 }
    );
  }
}
