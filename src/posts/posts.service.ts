import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/entities/user.entity';
import { slugGenerator } from 'src/utils/sluggen';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const slug = slugGenerator(createPostDto.title);
    
    const post = this.postRepository.create({
      ...createPostDto,
      slug,
      author: user,
    });

    return await this.postRepository.save(post);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { posts, total };
  }

  async findPublished(page: number = 1, limit: number = 10): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { status: 'published' },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { posts, total };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.id !== user.id) {
      throw new UnauthorizedException('You can only edit your own posts');
    }

    if (updatePostDto.title) {
      post.slug = slugGenerator(updatePostDto.title);
    }

    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: number, user: User): Promise<void> {
    const post = await this.findOne(id);

    if (post.author.id !== user.id) {
      throw new UnauthorizedException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
  }

  async findUserPosts(userId: number, page: number = 1, limit: number = 10): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { author: { id: userId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { posts, total };
  }
}
