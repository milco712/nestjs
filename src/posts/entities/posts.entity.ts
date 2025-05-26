import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {UsersModel} from "../../users/entities/users.entity";
import {BaseModel} from "../../common/entities/base.entity";
import {IsString} from "class-validator";
import {stringValidationMessage} from "../../common/validation-message/string-validation.message";
import {Transform} from "class-transformer";
import {POST_PUBLIC_IMAGE_PATH} from "../../common/const/path.const";
import {join} from "node:path";

@Entity()
export class PostsModel extends BaseModel{
    @ManyToOne(()=>UsersModel, (user)=>user.posts, { nullable: false })
    author: UsersModel;

    @Column()
    @IsString({
        message: stringValidationMessage
    })
    title: string;

    @Column()
    @IsString({
        message: stringValidationMessage
    })
    content: string;

    @Column({
        nullable: true
    })
    @Transform(({value})=> value && `/${join(POST_PUBLIC_IMAGE_PATH, value)}`)
    image?: string;

    @Column()
    likeCount: number;

    @Column()
    commentCount: number;
}