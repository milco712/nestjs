import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import path, { extname } from 'node:path';
import * as multer from 'multer';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from './const/path.const';
import { v4 as uuid } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from '../posts/entities/posts.entity';
import { UsersModel } from '../users/entities/users.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UsersModel]),
    UsersModule,
    AuthModule,
    MulterModule.register({
      limits: {
        fileSize: 10000000, // 바이트
      },
      fileFilter: (req, file, cb) => {
        if (!file || !file.originalname) {
          return cb(
            new BadRequestException('파일이 포함되지 않았습니다.'),
            false,
          );
        }
        const ext = extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return cb(
            new BadRequestException('jpg, jpeg, png 파일만 업로드 가능합니다.'),
            false,
          );
        }
        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, TEMP_FOLDER_PATH); // 에러, 파일 업로드할 위치
        },
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`); // 에러,
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService, AuthService, UsersService],
  exports: [CommonService],
})
export class CommonModule {}
