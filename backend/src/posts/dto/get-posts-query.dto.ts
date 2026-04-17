import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetPostsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: '페이지 번호',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: '페이지당 게시글 수',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'Nest',
    description: '제목/내용 검색 키워드',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: '정렬 기준',
    enum: ['createdAt', 'updatedAt', 'title'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title'])
  sortBy?: 'createdAt' | 'updatedAt' | 'title' = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    description: '정렬 방향',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
