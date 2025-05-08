import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModel} from "./entities/users.entity";

@Module({
  imports: [
      TypeOrmModule.forFeature([UsersModel])
  ],
  exports: [UsersService], // user.module 바깥에서도 사용하기 위해
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
