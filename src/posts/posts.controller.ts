import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Render, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get()
  @Render('posts/index')
  async index(@Query('page') page: number = 1) {
    const limit = 10;
    const { posts, total } = await this.postsService.findPublished(page, limit);
    const totalPages = Math.ceil(total / limit);

    return {
      title: 'Blog Posts',
      posts,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  @Get('create')
  @UseGuards(JwtAuthGuard)
  @Render('posts/create')
  createForm() {
    return { layout: 'layouts/admin', title: 'Create New Post' };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      await this.postsService.create(createPostDto, req.user as User);
      res.redirect('/admin/posts');
    } catch (error) {
      return res.render('posts/create', {
        title: 'Create New Post',
        layout: 'layouts/admin',
        error: error.message,
        post: createPostDto,
      });
    }
  }

  @Get(':slug')
  @Render('posts/show')
  async showBySlug(@Param('slug') slug: string) {
    const post = await this.postsService.findBySlug(slug);
    return {
      layout: 'layouts/admin',
      title: post.title,
      post,
    };
  }

  @Get(':id/edit')
  @UseGuards(JwtAuthGuard)
  @Render('posts/edit')
  async edit(@Param('id') id: string, @Req() req) {
    const post = await this.postsService.findOne(+id);

    if (post.author.id !== (req.user as User).id) {
      throw new Error('You can only edit your own posts');
    }

    return {
      layout: 'layouts/admin',
      title: 'Edit Post',
      post,
    };
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      await this.postsService.update(+id, updatePostDto, req.user as User);
      res.redirect('/admin/posts');
    } catch (error) {
      return res.render('posts/edit', {
        title: 'Edit Post',
        post: { id, ...updatePostDto },
        error: error.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req, @Res() res: Response) {
    try {
      await this.postsService.remove(+id, req.user as User);
      res.redirect('/posts');
    } catch (error) {
      res.redirect('/posts/' + id);
    }
  }

  @Get('user/dashboard')
  @UseGuards(JwtAuthGuard)
  @Render('posts/dashboard')
  async dashboard(@Req() req, @Query('page') page: number = 1) {
    const limit = 10;
    const { posts, total } = await this.postsService.findUserPosts((req.user as User).id, page, limit);
    const totalPages = Math.ceil(total / limit);

    return {
      title: 'My Posts',
      posts,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
