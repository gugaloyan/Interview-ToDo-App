import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { TodoResponseDto } from './dtos/todo-response.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new todo with error handling
  async createTodo(createTodoDto: CreateTodoDto): Promise<TodoResponseDto> {
    const { title, completed, userId } = createTodoDto;

    try {
      // Validate if the user exists
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      // Create the todo
      const todo = await this.prisma.todo.create({
        data: { title, completed: completed ?? false, userId },
      });

      return { id: todo.id, title: todo.title, completed: todo.completed };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // List all todos for a user with proper response formatting
  async listTodos(userId: number): Promise<TodoResponseDto[]> {
    try {
      // Fetch todos for the given user ID
      const todos = await this.prisma.todo.findMany({
        where: { userId },
      });

      return todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch todos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
