import {Injectable, NotFoundException} from '@nestjs/common';
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {PostsModel} from "./entities/posts.entity";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostsModel) // db와 연결된 레포지토리(도구) 주입(필요 객체 자동 생성)
        private readonly postsRepository: Repository<PostsModel> // 서비스 내부에서 사용할 필드(클래스 안 변수) 선언
    ) {}
    async getAllPosts() {
        return this.postsRepository.find({
            relations: ['author']
        })
    }

    async getPostById(id: number) {
        const post = await this.postsRepository.findOne({where: {id}, relations: ['author']});
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post
    }

    async createPost(authorId: number, postDto: CreatePostDto) {
        // 1) create 저장할 객체 생성
        // 2) save 객체를 저장
        const post = this.postsRepository.create({
            author: { // relation이기에 객체 상태
                id: authorId,
            },
            ...postDto,
            likeCount: 0,
            commentCount: 0,
        })
        return this.postsRepository.save(post)
    }

    async updatePost(postId: number, postDto: UpdatePostDto) {
        const title = postDto.title;
        const content = postDto.content;
        // save 1) 데이터가 존재하지 않으면 새로 생성 2) 데이터가 존재하면 데이터를 업데이트
        const post = await this.postsRepository.findOne({where: {id: postId}});
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
        const post = await this.postsRepository.findOne({where: {id: postId}});
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        await this.postsRepository.delete(postId);
        return postId
    }
}

