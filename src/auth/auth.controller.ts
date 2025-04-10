import { Controller, Get, Post, Body, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @Render('auth/login')
  getLoginPage() {
    return { 
      title: 'Login',
      layout: 'layouts/main',
      error: null 
    };
  }

  @Get('register')
  @Render('auth/register')
  getRegisterPage() {
    return { 
      title: 'Register',
      layout: 'layouts/main',
      error: null 
    };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(loginDto);
      res.cookie('jwt', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      console.log('result jwt', result);
      return res.redirect('/admin');
    } catch (error) {
      return res.render('auth/login', {
        title: 'Login',
        error: error.message,
      });
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      await this.authService.register(registerDto);
      return res.redirect('/auth/login');
    } catch (error) {
      return res.render('auth/register', {
        title: 'Register',
        error: error.message,
      });
    }
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.redirect('/');
  }
}
