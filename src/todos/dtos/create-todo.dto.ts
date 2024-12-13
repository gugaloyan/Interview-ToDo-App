import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  completed?: boolean;

  @IsNotEmpty()
  userId: number; // Link the todo to a user
}
