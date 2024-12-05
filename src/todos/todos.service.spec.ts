import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { TodoResponseDto } from './dtos/todo-response.dto';

describe('TodosService', () => {
  let todosService: TodosService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    todosService = module.get<TodosService>(TodosService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTodo', () => {
    it('should successfully create a todo if the user exists', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        completed: false,
        userId: 1,
      };

      // Mock Prisma methods
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });
      mockPrismaService.todo.create.mockResolvedValue({
        id: 1,
        title: createTodoDto.title,
        completed: createTodoDto.completed,
        userId: createTodoDto.userId,
      });

      const result = await todosService.createTodo(createTodoDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createTodoDto.userId },
      });
      expect(prismaService.todo.create).toHaveBeenCalledWith({
        data: {
          title: createTodoDto.title,
          completed: createTodoDto.completed,
          userId: createTodoDto.userId,
        },
      });
      expect(result).toEqual({
        id: 1,
        title: createTodoDto.title,
        completed: createTodoDto.completed,
      });
    });

    it('should throw an error if the user does not exist', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        completed: false,
        userId: 1,
      };

      // Mock Prisma to return null (user not found)
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(todosService.createTodo(createTodoDto)).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createTodoDto.userId },
      });
    });

    it('should throw an error if creating the todo fails', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        completed: false,
        userId: 1,
      };

      // Mock Prisma to return a valid user
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });
      // Mock Prisma to throw an error during todo creation
      mockPrismaService.todo.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(todosService.createTodo(createTodoDto)).rejects.toThrowError(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('listTodos', () => {
    it('should return a list of todos for the given user', async () => {
      const userId = 1;
      const todos = [
        { id: 1, title: 'Todo 1', completed: false },
        { id: 2, title: 'Todo 2', completed: true },
      ];

      // Mock Prisma to return todos
      mockPrismaService.todo.findMany.mockResolvedValue(todos);

      const result = await todosService.listTodos(userId);

      expect(prismaService.todo.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual([
        { id: 1, title: 'Todo 1', completed: false },
        { id: 2, title: 'Todo 2', completed: true },
      ]);
    });

    it('should throw an error if fetching todos fails', async () => {
      const userId = 1;

      // Mock Prisma to throw an error
      mockPrismaService.todo.findMany.mockRejectedValue(
        new Error('Failed to fetch todos'),
      );

      await expect(todosService.listTodos(userId)).rejects.toThrowError(
        new HttpException(
          'Failed to fetch todos',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
