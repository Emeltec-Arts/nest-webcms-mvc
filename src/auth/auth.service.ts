import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    // TODO: Inject an EmailService here later
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      // Remove sensitive data before returning
      const { password, resetPasswordToken, resetPasswordExpires, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role }; // Added role
    return {
      access_token: this.jwtService.sign(payload),
      user, // Consider removing sensitive data from user object if returned to client
    };
  }

  async register(registerDto: RegisterDto) {
    const { confirmPassword, ...userData } = registerDto;

    if (userData.password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        { email: userData.email },
        { username: userData.username },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('Email or Username already exists'); // Updated message
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'user', // Default role, adjust if needed
      resetPasswordToken: null, // Initialize new fields
      resetPasswordExpires: null,
    });

    await this.userRepository.save(user);
    // Remove sensitive data before returning
    const { password, resetPasswordToken, resetPasswordExpires, ...result } = user;
    return result;
  }

  // --- Password Reset Methods --- //

  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if the user exists or not for security reasons
      // Log the attempt internally if needed
      console.warn(`Password reset request for non-existent email: ${email}`);
      return; // Silently return
    }

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;

    // Set expiration time (e.g., 1 hour from now)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    user.resetPasswordExpires = expires;

    await this.userRepository.save(user);

    // TODO: Send email with the reset link
    // Example link: http://yourdomain.com/auth/reset-password?token=YOUR_TOKEN
    const resetLink = `http://localhost:3000/auth/reset-password-page?token=${token}`; // Adjust domain/port
    console.log(`Password reset link for ${email}: ${resetLink}`); // Placeholder for email sending

    // In a real app, use an email service:
    // await this.emailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    // Check if token has expired
    if (user.resetPasswordExpires === null || user.resetPasswordExpires < new Date()) {
      // Clear expired token details
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10);

    // Clear the reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    // Optionally, send a confirmation email
    // await this.emailService.sendPasswordResetConfirmationEmail(user.email);
    console.log(`Password successfully reset for user: ${user.email}`);
  }
}
