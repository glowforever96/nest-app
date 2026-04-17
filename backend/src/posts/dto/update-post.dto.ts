import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

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
}
