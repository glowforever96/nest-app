import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { PostsModule } from './posts/posts.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CommentsModule } from './comments/comments.module.js';

@Module({
  imports: [UsersModule, PostsModule, PrismaModule, AuthModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
