import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PostsModel} from "./entities/posts.entity";
import {JwtModule} from "@nestjs/jwt";
import {UsersModel} from "../users/entities/users.entity";
import {AuthService} from "../auth/auth.service";
import {UsersService} from "../users/users.service";

@Module({
  imports: [
      JwtModule.register({}),
      TypeOrmModule.forFeature([PostsModel, UsersModel]),
  ],
  controllers: [PostsController],
  providers: [PostsService, AuthService, UsersService],
})
export class PostsModule {}
