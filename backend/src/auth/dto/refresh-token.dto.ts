import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJ...',
    description: 'refresh token',
  })
  @IsString()
  @MinLength(10)
  refreshToken: string;
}
