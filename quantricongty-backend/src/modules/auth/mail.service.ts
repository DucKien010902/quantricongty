import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const user = process.env.EMAIL_USER || 'kiennd.forimex@gmail.com';
    const pass = process.env.EMAIL_PASS || 'zmzg uyiy zgdz ymcb';

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendOtpEmail(toEmail: string, otpCode: string, companyName: string): Promise<boolean> {
    try {
      const fromUser = process.env.EMAIL_USER || 'kiennd.forimex@gmail.com';
      const mailOptions = {
        from: `"${companyName}" <${fromUser}>`,
        to: toEmail,
        subject: `[${companyName}] Mã OTP xác thực đăng nhập: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1b365d; margin: 0; font-size: 20px;">${companyName}</h2>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Cổng Quản Trị & Điều Hành Nội Bộ</p>
            </div>

            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
              <p style="font-size: 14px; color: #334155; margin: 0 0 12px;">Mã xác thực OTP đăng nhập của bạn là:</p>
              <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b365d; background: #ffffff; padding: 12px 28px; border-radius: 10px; border: 2px dashed #94a3b8;">
                ${otpCode}
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0;">Mã có hiệu lực trong <b>5 phút</b>. Vui lòng không chia sẻ mã này cho người khác.</p>
            </div>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
              Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✉️ [EMAIL OTP THỰC TẾ] Đã gửi thư tới: ${toEmail} | MessageID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Lỗi gửi email OTP tới ${toEmail}:`, error);
      return false;
    }
  }
}
