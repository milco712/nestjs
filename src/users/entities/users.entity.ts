import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {RolesEnum} from "../const/roles.const";
import {PostsModel} from "../../posts/entities/posts.entity";
import {BaseModel} from "../../common/entities/base.entity";
import {IsEmail, IsString, Length, ValidationArguments} from "class-validator";
import {lengthValidationMessage} from "../../common/validation-message/length-validation.message";
import {stringValidationMessage} from "../../common/validation-message/string-validation.message";
import {emailValidationMessage} from "../../common/validation-message/email-validation.message";
import {Exclude, Expose} from "class-transformer";

@Entity()
export class UsersModel extends BaseModel {
    @Column({
        length: 20, // 20자 이하
        unique: true, // 유일무이한 값
    })
    @IsString({message: stringValidationMessage})
    @Length(1, 20, {message: lengthValidationMessage})
    nickname: string;

    @Column({unique: true})
    @IsString({message: stringValidationMessage})
    @IsEmail({},{message: emailValidationMessage})
    email: string;

    @Column()
    @IsString({message: stringValidationMessage})
    @Length(3, 8, {message: lengthValidationMessage})
    @Exclude({toPlainOnly: true})
    password: string;

    @Column({
        enum: Object.values(RolesEnum), // RolesEnum의 모든 값 가져옴
        default: RolesEnum.USER
    })
    role: RolesEnum

    @OneToMany(() => PostsModel, (post) => post.author)
    posts: PostsModel[];
}