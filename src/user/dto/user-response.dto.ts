import { TodoResponseDto } from '../../todos/dtos/todo-response.dto';

export class UserResponseDto {
  id: number;
  email: string;
  todos?: TodoResponseDto[];
}
