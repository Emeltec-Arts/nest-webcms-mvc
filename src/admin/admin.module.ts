import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [PostsModule],
  controllers: [AdminController],
})
export class AdminModule {}
