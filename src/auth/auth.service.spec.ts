import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let userService: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserService = {
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashed_password';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null); // No user found
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(userService, 'createUser').mockResolvedValue({
        id: 1,
        email: registerDto.email,
        todos: [],
      });

      const result = await authService.register(registerDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userService.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
      });
      expect(result).toEqual({
        id: 1,
        email: registerDto.email,
        todos: [],
      });
    });

    it('should throw an error if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 1,
        email: registerDto.email,
        password: 'hashed_password',
      }); // User already exists

      await expect(authService.register(registerDto)).rejects.toThrowError(
        new Error('User already exists'),
      );
    });
  });

  describe('login', () => {
    it('should log in a user successfully and return a token', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashed_password',
      };
      const secret = 'test_secret';
      const token = 'test_token';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); // Password matches
      jest.spyOn(configService, 'get').mockReturnValue(secret);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      jest.spyOn(jwt, 'sign').mockReturnValue(token);

      const result = await authService.login(loginDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwt.sign).toHaveBeenCalledWith({ userId: user.id }, secret, {
        algorithm: 'HS256',
        expiresIn: '12h',
      });
      expect(result).toEqual({ accessToken: token });
    });

    it('should throw an error if user does not exist', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null); // No user found

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new Error('Invalid credentials'),
      );
    });

    it('should throw an error if password is invalid', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashed_password',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false); // Password does not match

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new Error('Invalid credentials'),
      );
    });
  });
});
