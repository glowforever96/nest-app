import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostFileDto {
  @ApiPropertyOptional({
    example: '수정된 제목',
    description: '게시글 제목',
  })
  title?: string;

  @ApiPropertyOptional({
    example: '수정된 내용',
    description: '게시글 본문',
  })
  content?: string;

  @ApiPropertyOptional({
    example: false,
    description: '기존 이미지 삭제 여부',
  })
  removeImage?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: '새로 업로드할 대표 이미지',
  })
  file?: any;
}
