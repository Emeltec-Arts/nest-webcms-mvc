import { Controller, Get, Post, Body, Render, Res, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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

  @Get('forgot-password')
  @Render('auth/forgot-password')
  getForgotPasswordPage() {
    return {
      title: 'Forgot Password',
      layout: 'layouts/main',
      message: null,
      error: null,
    };
  }

  @Post('forgot-password')
  async requestPasswordReset(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response,
  ) {
    try {
      await this.authService.requestPasswordReset(forgotPasswordDto);
      return res.render('auth/forgot-password', {
        title: 'Forgot Password',
        layout: 'layouts/main',
        message: 'If an account with that email exists, a password reset link has been sent.',
        error: null,
      });
    } catch (error) {
      console.error('Forgot password request error:', error);
      return res.render('auth/forgot-password', {
        title: 'Forgot Password',
        layout: 'layouts/main',
        message: null,
        error: 'An error occurred. Please try again later.',
      });
    }
  }

  @Get('reset-password-page')
  @Render('auth/reset-password')
  getResetPasswordPage(@Query('token') token: string) {
    if (!token) {
      return { 
        title: 'Reset Password', 
        layout: 'layouts/main', 
        error: 'Invalid or missing reset token.', 
        token: null 
      };
    }
    return {
      title: 'Reset Password',
      layout: 'layouts/main',
      token: token,
      error: null,
      message: null,
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    try {
      await this.authService.resetPassword(resetPasswordDto);
      return res.redirect('/auth/login?reset=success');
    } catch (error) {
      console.error('Reset password error:', error);
      return res.render('auth/reset-password', {
        title: 'Reset Password',
        layout: 'layouts/main',
        token: resetPasswordDto.token,
        error: error.message || 'Failed to reset password. Please check the token or try requesting a new link.',
        message: null,
      });
    }
  }
}
