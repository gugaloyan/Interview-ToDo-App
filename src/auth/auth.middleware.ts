import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService for DB access

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService, // Inject PrismaService to access the database
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
    }

    try {
      console.log(11111111);
      console.log('>>>', this.configService.get<string>('JWT_SECRET'));
      // Decode the token and extract the userId
      const decoded = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET'),
      ) as { userId: number };
      console.log('decoded >>>>', decoded);
      // Fetch the full user object from the database
      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.userId },
      });
      console.log('user', user);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      // Attach the full user object to the request
      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
