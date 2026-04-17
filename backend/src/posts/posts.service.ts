import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { GetPostsQueryDto } from './dto/get-posts-query.dto.js';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetPostsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const keyword = query.keyword?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const skip = (page - 1) * limit;

    const where = keyword
      ? {
          OR: [
            {
              title: {
                contains: keyword,
                mode: 'insensitive' as const,
              },
            },
            {
              content: {
                contains: keyword,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const orderBy = {
      [sortBy]: sortOrder,
    } as const;

    const [items, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
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
      }),
      this.prisma.post.count({
        where,
      }),
    ]);

    console.log(totalItems);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
        sortBy,
        sortOrder,
        keyword: keyword ?? null,
      },
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
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

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  async findByUserId(userId: number, query: GetPostsQueryDto) {
    await this.ensureAuthorExists(userId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const keyword = query.keyword?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const skip = (page - 1) * limit;

    const where = {
      authorId: userId,
      ...(keyword
        ? {
            OR: [
              {
                title: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              },
              {
                content: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const orderBy = {
      [sortBy]: sortOrder,
    } as const;

    const [items, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
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
      }),
      this.prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
        sortBy,
        sortOrder,
        keyword: keyword ?? null,
        userId,
      },
    };
  }

  async create(authorId: number, createPostDto: CreatePostDto) {
    await this.ensureAuthorExists(authorId);

    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        authorId,
      },
      select: {
        id: true,
        title: true,
        content: true,
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
    updatePostDto: UpdatePostDto,
  ) {
    const post = await this.ensurePostExists(id);

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException('본인 게시글만 수정할 수 있습니다.');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      select: {
        id: true,
        title: true,
        content: true,
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
    const post = await this.ensurePostExists(id);

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException('본인 게시글만 삭제할 수 있습니다.');
    }

    return this.prisma.post.delete({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
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

  private async ensurePostExists(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }
}
