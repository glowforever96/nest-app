import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    example: '댓글 내용을 수정했습니다.',
    description: '수정할 댓글 내용',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}
