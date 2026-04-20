import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({
    example: '수정된 제목',
    description: '게시글 제목',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiProperty({
    example: '수정된 내용',
    description: '게시글 본문',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @ApiPropertyOptional({
    example: false,
    description: '기존 이미지를 삭제할지 여부',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  removeImage?: boolean;
}
