import nodemailer from 'nodemailer';

export interface EmailDispatchResult {
  isDelivered: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export const emailGateway = {
  /**
   * Check if real email delivery credentials are configured in .env
   */
  isConfigured: (): boolean => {
    const user = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
    return Boolean(user && pass);
  },

  /**
   * Send 6-Digit OTP Email via Gmail or custom SMTP
   */
  sendOtpEmail: async (
    toEmail: string,
    otpCode: string,
    recipientName?: string
  ): Promise<EmailDispatchResult> => {
    const user = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;

    if (!user || !pass) {
      console.warn('⚠️ [EMAIL GATEWAY] No EMAIL_USER or EMAIL_PASS configured in .env. Real email delivery skipped.');
      return {
        isDelivered: false,
        provider: 'UNCONFIGURED',
        error: 'EMAIL_USER and EMAIL_PASS not configured in .env'
      };
    }

    try {
      const isGmail = host.includes('gmail') || !process.env.SMTP_HOST;
      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: 'gmail',
              auth: {
                user,
                pass
              }
            }
          : {
              host,
              port,
              secure: port === 465,
              auth: {
                user,
                pass
              }
            }
      );

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background-color: #0A0A0A; color: #F0F0F0; border-radius: 20px; border: 1px solid #2E2E32; overflow: hidden; padding: 28px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px;">🍲</span>
            <h1 style="color: #E2FF3B; font-size: 22px; margin: 8px 0 4px; font-weight: 800; letter-spacing: -0.5px;">Street Radar</h1>
            <p style="color: #8E8E93; font-size: 13px; margin: 0;">Nearby Food Stall & Cycle Idli Finder</p>
          </div>

          <div style="background-color: #141414; border: 1px solid #262626; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #A1A1AA; font-size: 14px; margin: 0 0 12px;">Hello ${recipientName || 'Foodie'},</p>
            <p style="color: #D4D4D8; font-size: 14px; margin: 0 0 18px;">Your 6-digit verification code to log in or register is:</p>
            <div style="display: inline-block; background-color: #1C1C1E; border: 2px solid #E2FF3B; border-radius: 12px; padding: 14px 28px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #E2FF3B; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="color: #71717A; font-size: 12px; margin: 16px 0 0;">This code will expire in 10 minutes. Do not share it with anyone.</p>
          </div>

          <div style="border-top: 1px solid #222; padding-top: 16px; text-align: center; font-size: 11px; color: #52525B;">
            <p style="margin: 0;">© Street Radar • Ultra-local food stalls & cycle carts finder</p>
            <p style="margin: 4px 0 0;">No SMS needed • 100% Email Authentication</p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: `"Street Radar" <${user}>`,
        to: toEmail,
        subject: `[Street Radar] Your Login Verification Code: ${otpCode}`,
        text: `Your Street Radar verification code is: ${otpCode}. Valid for 10 minutes.`,
        html: htmlContent
      });

      console.log(`✅ [EMAIL GATEWAY] Email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      return {
        isDelivered: true,
        provider: isGmail ? 'Gmail SMTP' : 'Custom SMTP',
        messageId: info.messageId
      };
    } catch (err: any) {
      console.error('❌ [EMAIL GATEWAY] Failed to send email:', err.message);
      return {
        isDelivered: false,
        provider: 'SMTP_FAILED',
        error: err.message
      };
    }
  }
};
