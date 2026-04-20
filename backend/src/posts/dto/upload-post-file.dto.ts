import { ApiProperty } from '@nestjs/swagger';

export class UploadPostFileDto {
  @ApiProperty({
    example: '파일 업로드가 붙은 게시글',
    description: '게시글 제목',
  })
  title: string;

  @ApiProperty({
    example: '대표 이미지가 있는 게시글입니다.',
    description: '게시글 본문',
  })
  content: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '게시글 대표 이미지 파일',
  })
  file: any;
}
