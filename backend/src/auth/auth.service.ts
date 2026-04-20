import { LoginDto } from './dto/login.dto.js';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { SignupDto } from './dto/signup.dto.js';
import * as bcrypt from 'bcrypt';

type UserRole = 'USER' | 'ADMIN';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userService.findOneByEmailForAuth(
      signupDto.email,
    );

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: signupDto.email,
        name: signupDto.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    await this.saveHashedRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    await this.saveHashedRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmailForAuth(email);
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    return user;
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async refreshTokens(refreshToken: string) {
    let payload: { sub: number; email: string; role: UserRole };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || typeof user.hashedRefreshToken !== 'string') {
      throw new UnauthorizedException('refresh token이 유효하지 않습니다.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const savedRefreshTokenHash = user.hashedRefreshToken;

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      savedRefreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('refresh token이 유효하지 않습니다.');
    }

    const tokens = await this.issueTokenPair(user.id, user.email, user.role);
    await this.saveHashedRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      ...tokens,
    };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken: null,
      },
    });

    return {
      success: true,
    };
  }

  private async issueTokenPair(userId: number, email: string, role: UserRole) {
    const accessToken = await this.signAccessToken(userId, email, role);
    const refreshToken = await this.signRefreshToken(userId, email, role);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signAccessToken(userId: number, email: string, role: UserRole) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        email,
        role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN as JwtSignOptions['expiresIn'],
      },
    );
  }

  private async signRefreshToken(
    userId: number,
    email: string,
    role: UserRole,
  ) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        email,
        role,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env
          .JWT_REFRESH_EXPIRES_IN as JwtSignOptions['expiresIn'],
      },
    );
  }

  private async saveHashedRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken,
      },
    });
  }
}
