import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: '좋은 글이네요.',
    description: '댓글 내용',
  })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({
    example: 1,
    description: '댓글이 달릴 게시글 ID',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId: number;
}
