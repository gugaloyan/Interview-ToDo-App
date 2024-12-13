import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { JwtMiddleware } from '../auth/auth.middleware';

@Module({
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware) // Apply the middleware
      .forRoutes(TodosController); // Protect all routes in TodosController
  }
}
