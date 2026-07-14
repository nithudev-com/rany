import { EmailJob, EmailTemplate } from "@prisma/client";
import nodemailer from "nodemailer";

export interface ProviderResponse {
  success: boolean;
  messageId?: string;
  error?: any;
}

export interface EmailProvider {
  sendEmail(job: EmailJob, template: EmailTemplate, recipient: string): Promise<ProviderResponse>;
}

export class SMTPProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM_ADDRESS || "noreply@yourstore.com";
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });
  }

  async sendEmail(job: EmailJob, template: EmailTemplate, recipient: string): Promise<ProviderResponse> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials missing, simulating email send.");
      return { success: true, messageId: `sim-${Date.now()}` };
    }

    // Replace variables in the template (e.g. {{name}}) based on job.payload
    let html = template.htmlBody;
    let text = template.textBody || "";
    let subject = template.subject;

    if (job.payload && typeof job.payload === "object" && !Array.isArray(job.payload)) {
      const payload = job.payload as Record<string, string | number | boolean>;
      for (const [key, value] of Object.entries(payload)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        html = html.replace(regex, String(value));
        text = text.replace(regex, String(value));
        subject = subject.replace(regex, String(value));
      }
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: recipient,
        subject: subject,
        text: text || undefined,
        html: html,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("SMTP Send Error:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}

export const emailProvider = new SMTPProvider();
