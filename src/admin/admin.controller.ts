import { Controller, Get, UseGuards, Render, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from '../posts/posts.service';
import { User } from '../users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @Render('admin/dashboard')
  async getDashboard(@Req() req) {
    const user = req.user as User;
    const { posts, total: totalPosts } = await this.postsService.findUserPosts(user.id);
    const { posts: publishedPosts } = await this.postsService.findPublished();

    return {
      layout: 'layouts/admin',
      title: 'Dashboard',
      activeMenu: 'dashboard',
      totalPosts,
      publishedPosts: publishedPosts.length,
      recentPosts: posts.slice(0, 5),
      user: {
        id: user.id,
        name: user.username,
        email: user.email
      }
    };
  }

  @Get('posts')
  @Render('admin/posts')
  async getPosts(@Req() req) {
    const user = req.user as User;
    const { posts, total } = await this.postsService.findUserPosts(user.id);

    return {
      layout: 'layouts/admin',
      title: 'Manage Posts',
      activeMenu: 'posts',
      posts,
      total,
    };
  }

  @Get('users')
  @Render('admin/users')
  getUsers() {
    return {
      layout: 'layouts/admin',
      title: 'Manage Users',
      activeMenu: 'users',
    };
  }
}
