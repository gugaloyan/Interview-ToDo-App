import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add the 'user' property, which will store the user object
    }
  }
}
