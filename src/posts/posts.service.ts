import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { CommonService } from '../common/common.service';
import { ConfigService } from '@nestjs/config';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from '../common/const/env-keys.const';
import {
  POST_IMAGE_PATH,
  PUBLIC_FOLDER_PATH,
  TEMP_FOLDER_PATH,
} from '../common/const/path.const';
import { basename, join } from 'node:path';
import { promises } from 'fs';
import * as process from 'node:process';
import { CreatePostImageDto } from './image/dto/create-image.dto';
import { ImageModel } from '../common/entities/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';
import { async } from 'rxjs';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel) // db와 연결된 레포지토리(도구) 주입(필요 객체 자동 생성)
    private readonly postsRepository: Repository<PostsModel>, // 서비스 내부에서 사용할 필드(클래스 안 변수) 선언
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
    });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 만들 제목 ${i}`,
        content: `임의로 만든 내용 ${i}`,
        images: [],
      });
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    // if (dto.page){
    //     return this.pagePaginatePosts(dto)
    // } else {
    //     return this.cursorPaginatePosts(dto)
    // }
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        ...DEFAULT_POST_FIND_OPTIONS,
      },
      'posts',
    );
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * (dto.page ?? -1),
      take: dto.take,
      order: { createdAt: dto.order__createdAt },
    });
    // data: Deta[],
    // total: number,
    return { data: posts, total: count };
  }

  // 커서는 기준(마지막id)를 가지고 이전/이후 데이터를 가져옴
  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};
    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than); // post id가 dto id보다 작은 다음 값 ex. dto.where__id__less_than = 2이면 1
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than); // post id가 dto id보다 큰 다음 값
    }
    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
    // Response
    // data: Data[]
    // cursor: { after: 마지막 id} ex 가져온 12개 중 12번째
    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;
    // count: 응답 데이터 개수
    // next: 다음 요청에 사용할 url
    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);
    const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`);
    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      const key =
        dto.order__createdAt === 'ASC'
          ? 'where__id__more_than'
          : 'where__id__less_than';
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }
    return {
      data: posts,
      cursor: { after: lastItem?.id ?? null },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<PostsModel>(PostsModel)
      : this.postsRepository;
  }

  async createPost(authorId: number, postDto: CreatePostDto, qr?: QueryRunner) {
    // 1) create 저장할 객체 생성
    // 2) save 객체를 저장
    const repository = this.getRepository(qr);
    const post = repository.create({
      author: {
        // relation이기에 객체 상태
        id: authorId,
      },
      ...postDto,
      images: [],
      likeCount: 0,
      commentCount: 0,
    });
    return repository.save(post);
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const title = postDto.title;
    const content = postDto.content;
    // save 1) 데이터가 존재하지 않으면 새로 생성 2) 데이터가 존재하면 데이터를 업데이트
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }
    return this.postsRepository.save(post);
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postsRepository.delete(postId);
    return postId;
  }
}
