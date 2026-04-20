import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { GetPostsQueryDto } from './dto/get-posts-query.dto.js';
import { deleteFileByUrl } from '../common/utils/file.util.js';

type UploadedFile = {
  filename: string;
};

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

    const where = {
      deletedAt: null,
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
          imageUrl: true,
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
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        imageUrl: true,
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        comments: {
          where: { deletedAt: null },
          orderBy: {
            createdAt: 'desc',
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
      deletedAt: null,
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
          imageUrl: true,
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

  async findDeletedPosts(query: GetPostsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const keyword = query.keyword?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: {
        not: null,
      },
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
          imageUrl: true,
          deletedAt: true,
          author: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
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
      },
    };
  }

  async create(
    authorId: number,
    createPostDto: CreatePostDto,
    file?: UploadedFile,
  ) {
    await this.ensureAuthorExists(authorId);

    const imageUrl = file ? `/uploads/posts/${file.filename}` : null;

    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        authorId,
        imageUrl,
      },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        imageUrl: true,
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
    file?: UploadedFile,
  ) {
    const post: {
      id: number;
      authorId: number;
      imageUrl: string | null;
    } | null = await this.prisma.post.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        authorId: true,
        imageUrl: true,
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException('본인 게시글만 수정할 수 있습니다.');
    }

    let imageUrl: string | null = post.imageUrl;

    // 새 이미지 업로드 시 기존 이미지 삭제 후 교체
    if (file) {
      deleteFileByUrl(post.imageUrl);
      imageUrl = `/uploads/posts/${file.filename}`;
    }

    if (updatePostDto.removeImage && !file) {
      deleteFileByUrl(post.imageUrl);
      imageUrl = null;
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...(updatePostDto.title !== undefined && {
          title: updatePostDto.title,
        }),
        ...(updatePostDto.content !== undefined && {
          content: updatePostDto.content,
        }),
        imageUrl,
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
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

    return this.prisma.post.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
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

  async restore(id: number) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: { not: null } },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('복구할 게시글을 찾을 수 없습니다.');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
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
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }
}
