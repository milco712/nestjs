import {
  Body, ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put, Query,
  Request,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {AccessTokenGuard} from "../auth/guard/bearer-token.guard";
import {UsersModel} from "../users/entities/users.entity";
import {User} from "../users/decorator/user.decorator";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate-post.dto";

@Controller('posts')
export class PostsController {
  // 서비스를 자동으로 찾아 넣어줌, 왜? 이 클래스가 providers에 등록되어 nestjs가 의존성을 관리하기 때문
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(
      @Query() query: PaginatePostDto
  ) {
    return this.postsService.paginatePosts(query)
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User('id') userId: number,) {
    await this.postsService.generatePosts(userId)
    return true;
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id)
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(
      @User('id') userId: number,
      @Body() body: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, body)
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body)
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id)
  }
}
