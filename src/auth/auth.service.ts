import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private UserService: UserService,
  ) {}

  // Register a new user
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.UserService.createUser({ email, password: hashedPassword });
  }

  // Log in the user and generate JWT token
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    // Use ConfigService to access the JWT_SECRET
    const secret = this.configService.get<string>('JWT_SECRET');
    console.log('JWT Secret:', secret); // Debugging
    const token = jwt.sign({ userId: user.id }, secret, {
      algorithm: 'HS256',
      expiresIn: '12h',
    });

    return { accessToken: token };
  }
}
