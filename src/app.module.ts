import {ClassSerializerInterceptor, Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PostsModel} from "./posts/entities/posts.entity";
import { UsersModule } from './users/users.module';
import {UsersModel} from "./users/entities/users.entity";
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ConfigModule} from "@nestjs/config";
import * as process from "node:process";
import {
  ENV_DB_DATABASE,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME, ENV_HOST_KEY
} from "./common/const/env-keys.const";
import {ServeStaticModule} from "@nestjs/serve-static";
import {PUBLIC_FOLDER_PATH} from "./common/const/path.const";

@Module({
  imports: [
    PostsModule,
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public'
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY]!),
      username: process.env[ENV_DB_USERNAME],
      password: process.env[ENV_DB_PASSWORD],
      database: process.env[ENV_DB_DATABASE],
      entities: [
          PostsModel,
          UsersModel,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule],
  controllers: [AppController],
  providers: [AppService,{
    provide: APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor
  }],
})
export class AppModule {}
