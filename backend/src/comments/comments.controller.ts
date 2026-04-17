import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { CurrentUserType } from '../auth/types/current-user.type.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('post/:postId')
  @ApiOkResponse({ description: '게시글별 댓글 목록 조회 성공' })
  findByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findByPostId(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({ description: '댓글 생성 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 필요' })
  create(
    @CurrentUser() user: CurrentUserType,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.userId, createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: '댓글 수정 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 필요' })
  @ApiForbiddenResponse({ description: '본인 댓글만 수정 가능' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserType,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user.userId, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: '댓글 삭제 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 필요' })
  @ApiForbiddenResponse({ description: '본인 댓글만 삭제 가능' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.commentsService.remove(id, user.userId);
  }
}
