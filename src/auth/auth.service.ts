import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { email },
      });
    }

    const otpCode = this.generateOTP();
    const cacheKey = `otp:${email}`;

    await this.cacheManager.set(cacheKey, otpCode, 300000);

    return {
      message: 'OTP generated successfully',
      otp: otpCode,
      email,
    };
  }

  async verify(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const cacheKey = `otp:${email}`;
    const cachedOtp = await this.cacheManager.get<string>(cacheKey);

    if (!cachedOtp || cachedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.cacheManager.del(cacheKey);

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
