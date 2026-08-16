import { ENV } from "./_core/env";

export type ComplianceAlert = {
  recipient: string | null;
  subject: string;
  detail: string;
};

export function emailDeliveryReady(recipient: string | null) {
  return Boolean(recipient && ENV.resendApiKey && ENV.resendFromEmail);
}

export async function sendComplianceAlert(alert: ComplianceAlert) {
  if (!emailDeliveryReady(alert.recipient)) return { delivered: false as const, reason: "Email delivery is not configured." };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: ENV.resendFromEmail,
      to: [alert.recipient],
      subject: alert.subject,
      text: `${alert.detail}\n\nMetrcMatch is an advisory reconciliation tool. Verify the underlying records and complete required reporting as appropriate.`,
    }),
  });
  if (!response.ok) throw new Error(`Alert email provider returned ${response.status}.`);
  return { delivered: true as const };
}
