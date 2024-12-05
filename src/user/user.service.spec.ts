import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should successfully create a new user if the email does not exist', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock Prisma to simulate no existing user
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      // Mock Prisma to simulate user creation
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        email: createUserDto.email,
        todos: [],
      });

      const result: UserResponseDto =
        await userService.createUser(createUserDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { email: createUserDto.email, password: createUserDto.password },
        include: { todos: true },
      });
      expect(result).toEqual({
        id: 1,
        email: createUserDto.email,
        todos: [],
      });
    });

    it('should throw an error if the user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock Prisma to simulate an existing user
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: createUserDto.email,
      });

      await expect(userService.createUser(createUserDto)).rejects.toThrowError(
        new HttpException('User already exists', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error if creating the user fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock Prisma to simulate no existing user
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      // Mock Prisma to throw an error during user creation
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(userService.createUser(createUserDto)).rejects.toThrowError(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return a list of users with their todos', async () => {
      const users = [
        {
          id: 1,
          email: 'test@example.com',
          todos: [{ id: 1, title: 'Todo 1', completed: false }],
        },
        { id: 2, email: 'test2@example.com', todos: [] },
      ];

      // Mock Prisma to return a list of users with todos
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result: UserResponseDto[] = await userService.getAllUsers();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        include: { todos: true },
      });
      expect(result).toEqual([
        {
          id: 1,
          email: 'test@example.com',
          todos: [{ id: 1, title: 'Todo 1', completed: false }],
        },
        { id: 2, email: 'test2@example.com', todos: [] },
      ]);
    });

    it('should throw an error if fetching users fails', async () => {
      // Mock Prisma to throw an error
      mockPrismaService.user.findMany.mockRejectedValue(
        new Error('Failed to fetch users'),
      );

      await expect(userService.getAllUsers()).rejects.toThrowError(
        new HttpException(
          'Failed to fetch users',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
