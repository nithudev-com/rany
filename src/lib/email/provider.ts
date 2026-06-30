import { EmailJob, EmailTemplate } from "@prisma/client";

export interface ProviderResponse {
  success: boolean;
  messageId?: string;
  error?: any;
}

export interface EmailProvider {
  sendEmail(job: EmailJob, template: EmailTemplate, recipient: string): Promise<ProviderResponse>;
}

export class ResendProvider implements EmailProvider {
  private apiKey: string;
  private fromAddress: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
    this.fromAddress = process.env.EMAIL_FROM_ADDRESS || "noreply@yourstore.com";
  }

  async sendEmail(job: EmailJob, template: EmailTemplate, recipient: string): Promise<ProviderResponse> {
    if (!this.apiKey) {
      console.warn("Resend API key missing, simulating email send.");
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
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: this.fromAddress,
          to: recipient,
          subject: subject,
          html: html,
          text: text || undefined
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data };
      }
      
      return { success: true, messageId: data.id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}

export const emailProvider = new ResendProvider();
