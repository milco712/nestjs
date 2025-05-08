import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {UsersModel} from "../../users/entities/users.entity";
import {BaseModel} from "../../common/entities/base.entity";
import {IsString} from "class-validator";
import {stringValidationMessage} from "../../common/validation-message/string-validation.message";

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

    @Column()
    likeCount: number;

    @Column()
    commentCount: number;
}