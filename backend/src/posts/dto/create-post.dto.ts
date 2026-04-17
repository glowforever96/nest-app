import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: '인증 기반 첫 글',
    description: '게시글 제목',
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: '이제 Swagger에서도 바로 테스트할 수 있습니다.',
    description: '게시글 본문',
  })
  @IsString()
  @MinLength(1)
  content: string;
}
