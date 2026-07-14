import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('MAIL_HOST'),
      port: Number(this.configService.getOrThrow<string>('MAIL_PORT')),
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendAccountActivation(params: {
    to: string;
    fullName?: string;
    activationLink: string;
  }): Promise<void> {
    await this.sendLinkMail({
      ...params,
      link: params.activationLink,
      subject: 'Kích hoạt tài khoản HRM',
      heading: 'Kích hoạt tài khoản HRM',
      description:
        'Tài khoản HRM của bạn đã được tạo. Bấm vào link dưới đây đã kích hoạt và đặt lại mật khẩu',
      buttonText: 'Kích hoạt tài khoản',
      expiresIn: '24 giờ',
      errorContext: 'kích hoạt tài khoản',
    });
  }

  async sendPasswordReset(params: {
    to: string;
    fullName?: string;
    resetLink: string;
  }): Promise<void> {
    await this.sendLinkMail({
      ...params,
      link: params.resetLink,
      subject: 'Đặt lại mật khẩu HRM',
      heading: 'Đặt lại mật khẩu',
      description:
        'Hệ thống đã nhận yêu cầu cài đặt lại mật khẩu. Bấm vào liên kết dưới đây để tiếp tục',
      buttonText: 'Đặt lại mật khẩu',
      expiresIn: '30 phut',
      errorContext: 'đặt lại mật khẩu',
    });
  }

  private async sendLinkMail(params: {
    to: string;
    fullName?: string;
    link: string;
    subject: string;
    heading: string;
    description: string;
    buttonText: string;
    expiresIn: string;
    errorContext: string;
  }): Promise<void> {
    const fromName =
      this.configService.get<string>('MAIL_FROM_NAME') ?? 'HRM System';
    const fromAddress =
      this.configService.getOrThrow<string>('MAIL_FROM_ADDRESS');
    const greetingName = params.fullName ?? 'ban';

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: params.to,
        subject: params.subject,
        text: `
Xin chào ${greetingName},

${params.description}

Liên kết: ${params.link}

Liên kết sẽ hết hạn sau ${params.expiresIn}. Nếu bạn không yêu cầu thao tác này vui lòng bỏ qua email
        `.trim(),
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h2>${params.heading}</h2>
            <p>Xin chao <strong>${greetingName}</strong>,</p>
            <p>${params.description}</p>
            <p style="margin: 28px 0;">
              <a href="${params.link}" style="display: inline-block; padding: 12px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700;">
                ${params.buttonText}
              </a>
            </p>
            <p>Liên kết sẽ hết hạn sau <strong>${params.expiresIn}</strong>.</p>
            <p>Nếu nút bấm không hoạt động, hãy sao chép liên kết vào trình duyệt:</p>
            <p style="word-break: break-all; color: #2563eb;">${params.link}</p>
            <p>Nếu bạn không yêu cầu thao tác này vui lòng bỏ qua email.</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(
        `Không thể gửi email ${params.errorContext} den ${params.to}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        `Không thể gửi emaill ${params.errorContext}`,
      );
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error(
        'Kết nối SMTP thất bại',
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }
}
