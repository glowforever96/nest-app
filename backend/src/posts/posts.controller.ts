import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { CurrentUserType } from '../auth/types/current-user.type.js';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetPostsQueryDto } from './dto/get-posts-query.dto.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOkResponse({ description: '게시글 목록 조회 성공' })
  findAll(@Query() query: GetPostsQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get('user/:userId')
  @ApiOkResponse({ description: '특정 사용자 게시글 목록 조회 성공' })
  findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: GetPostsQueryDto,
  ) {
    return this.postsService.findByUserId(userId, query);
  }

  @Get(':id')
  @ApiOkResponse({ description: '게시글 상세 조회 성공' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/deleted')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: '삭제된 게시글 목록 조회 성공 (관리자)' })
  findDeleted(@Query() query: GetPostsQueryDto) {
    return this.postsService.findDeletedPosts(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({ description: '게시글 생성 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 필요' })
  create(
    @CurrentUser() user: CurrentUserType,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(user.userId, createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: '게시글 수정 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 필요' })
  @ApiForbiddenResponse({ description: '본인 게시글만 수정 가능' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserType,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.userId, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: '게시글 삭제 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 필요' })
  @ApiForbiddenResponse({ description: '본인 게시글만 삭제 가능' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.postsService.remove(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/restore')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: '게시글 복구 성공 (관리자)' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.restore(id);
  }
}
