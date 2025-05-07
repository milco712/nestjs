import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {UsersModel} from "../../users/entities/users.entity";
import {BaseModel} from "../../common/entities/base.entity";
import {IsString} from "class-validator";

@Entity()
export class PostsModel extends BaseModel{
    @ManyToOne(()=>UsersModel, (user)=>user.posts, { nullable: false })
    author: UsersModel;

    @Column()
    @IsString({
        message: 'title은 string 타입을 입력해야합니다.'
    })
    title: string;

    @Column()
    @IsString({
        message: 'content는 string 타입을 입력해야합니다.'
    })
    content: string;

    @Column()
    likeCount: number;

    @Column()
    commentCount: number;
}