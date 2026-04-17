import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

type CurrentUserType = {
  userId: number;
  email: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiCreatedResponse({ description: '회원가입 성공' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @ApiOkResponse({ description: '로그인 성공' })
  @ApiUnauthorizedResponse({
    description: '이메일 또는 비밀번호가 올바르지 않음',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: '내 정보 조회 성공' })
  @ApiUnauthorizedResponse({ description: 'JWT 토큰이 없거나 유효하지 않음' })
  me(@CurrentUser() user: CurrentUserType) {
    return this.authService.getProfile(user.userId);
  }
}
