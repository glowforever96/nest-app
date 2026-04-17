import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    example: 'kim@example.com',
    description: '사용자 이메일',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Kim',
    description: '사용자 이름',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'password123',
    description: '비밀번호',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
