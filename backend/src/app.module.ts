import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { PostsModule } from './posts/posts.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [UsersModule, PostsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
