export interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ toEmail, toName, subject, htmlContent }: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@expaura.rw";
  const senderName = process.env.BREVO_SENDER_NAME || "Expaura Platform";

  // Development fallback when key is not configured yet
  if (!apiKey || apiKey === "your_brevo_api_key_here") {
    console.log(`\n================ [DEV BREVO EMAIL] ================`);
    console.log(`To: ${toName ? `${toName} <${toEmail}>` : toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${htmlContent}`);
    console.log(`====================================================\n`);
    return { success: true, messageId: "dev-simulated-id" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName || toEmail }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Brevo Email Error]", errorData);
      return { success: false, error: errorData.message || "Failed to send email via Brevo API" };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("[Brevo HTTP Exception]", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error sending email" };
  }
}
