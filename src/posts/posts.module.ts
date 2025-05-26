import {BadRequestException, Module} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PostsModel} from "./entities/posts.entity";
import {JwtModule} from "@nestjs/jwt";
import {UsersModel} from "../users/entities/users.entity";
import {AuthService} from "../auth/auth.service";
import {UsersService} from "../users/users.service";
import {AuthModule} from "../auth/auth.module";
import {UsersModule} from "../users/users.module";
import {CommonModule} from "../common/common.module";
import {MulterModule} from "@nestjs/platform-express";
import * as multer from "multer";
import * as path from "node:path";
import {POST_IMAGE_PATH} from "../common/const/path.const";
import {v4 as uuid} from 'uuid';

@Module({
  imports: [
      JwtModule.register({}),
      TypeOrmModule.forFeature([PostsModel, UsersModel]),
      AuthModule,
      UsersModule,
      CommonModule,
      MulterModule.register({
          limits: {
              fileSize: 10000000, // 바이트
          },
          fileFilter: (req, file, cb) => {
             const ext = path.extname(file.originalname);
             if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
                 return cb(
                     new BadRequestException('jpg, jpeg, png 파일만 업로드 가능합니다.'), false
                 )
             }
             return cb(null, true)
          },
          storage: multer.diskStorage({
              destination: (req, file, cb) => {
                  cb(null, POST_IMAGE_PATH);// 에러, 파일 업로드할 위치
              },
              filename: (req, file, cb) => {
                  cb(null, `${uuid()}${path.extname(file.originalname)}`); // 에러,
              }
          })
      })
  ],
  controllers: [PostsController],
  providers: [PostsService, AuthService, UsersService],
})
export class PostsModule {}
