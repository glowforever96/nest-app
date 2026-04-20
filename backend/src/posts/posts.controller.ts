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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { CurrentUserType } from '../auth/types/current-user.type.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetPostsQueryDto } from './dto/get-posts-query.dto.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { postImageMulterOptions } from '../common/multer/multer.options.js';
import { UploadPostFileDto } from './dto/upload-post-file.dto.js';
import { UpdatePostFileDto } from './dto/update-post-file.dto.js';

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
  @UseInterceptors(FileInterceptor('file', postImageMulterOptions))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '게시글 + 대표 이미지 업로드',
    type: UploadPostFileDto,
  })
  @ApiCreatedResponse({ description: '게시글 생성 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 필요' })
  create(
    @CurrentUser() user: CurrentUserType,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postsService.create(user.userId, createPostDto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', postImageMulterOptions))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '게시글 수정 + 대표 이미지 교체/삭제',
    type: UpdatePostFileDto,
  })
  @ApiOkResponse({ description: '게시글 수정 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 필요' })
  @ApiForbiddenResponse({ description: '본인 게시글만 수정 가능' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserType,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postsService.update(id, user.userId, updatePostDto, file);
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
