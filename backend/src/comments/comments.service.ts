import { CreateCommentDto } from './dto/create-comment.dto.js';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPostId(postId: number) {
    await this.ensurePostExists(postId);

    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async create(authorId: number, createCommentDto: CreateCommentDto) {
    await this.ensureAuthorExists(authorId);
    await this.ensurePostExists(createCommentDto.postId);

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId: createCommentDto.postId,
        authorId,
      },
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    currentUserId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.ensureCommentExists(id);

    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException('본인 댓글만 수정할 수 있습니다.');
    }

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: number, currentUserId: number) {
    const comment = await this.ensureCommentExists(id);

    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException('본인 댓글만 삭제할 수 있습니다.');
    }

    return this.prisma.comment.delete({
      where: { id },
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  private async ensureAuthorExists(authorId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('작성자를 찾을 수 없습니다.');
    }

    return user;
  }

  private async ensurePostExists(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  private async ensureCommentExists(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comment;
  }
}
