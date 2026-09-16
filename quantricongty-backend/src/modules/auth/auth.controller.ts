import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('quick-admin')
  async quickAdminLogin() {
    return this.authService.quickAdminLogin();
  }

  // 1. GỬI MÃ OTP VỀ EMAIL (KIỂM TRA WHITELIST)
  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  // 2. XÁC THỰC MÃ OTP
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  // 3. ĐĂNG NHẬP GOOGLE WHITELIST
  @Post('google-whitelist')
  async googleWhitelistLogin(@Body() body: { email: string; name?: string; picture?: string }) {
    return this.authService.googleWhitelistLogin(body);
  }

  @Post('login')
  async loginWithEmail(@Body() body: { email: string; password?: string }) {
    return this.authService.loginWithEmail(body.email, body.password);
  }

  @Post('google')
  async googleLogin(@Body() body: { email: string; name: string; picture?: string; sub?: string }) {
    return this.authService.googleWhitelistLogin(body);
  }

  @Post('join-by-invite')
  async joinByInvite(
    @Body()
    body: {
      inviteCode?: string;
      email?: string;
      name?: string;
      password?: string;
    },
  ) {
    return this.authService.joinByInvite(body);
  }
}
