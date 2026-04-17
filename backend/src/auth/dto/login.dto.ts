import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'kim@example.com',
    description: '로그인 이메일',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: '로그인 비밀번호',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
