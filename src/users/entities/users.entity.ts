import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {RolesEnum} from "../const/roles.const";
import {PostsModel} from "../../posts/entities/posts.entity";
import {BaseModel} from "../../common/entities/base.entity";

@Entity()
export class UsersModel extends BaseModel {
    @Column({
        length: 20, // 20자 이하
        unique: true, // 유일무이한 값
    })
    nickname: string;

    @Column({
        unique: true,
    })
    email: string;

    @Column()
    password: string;

    @Column({
        enum: Object.values(RolesEnum), // RolesEnum의 모든 값 가져옴
        default: RolesEnum.USER
    })
    role: RolesEnum

    @OneToMany(() => PostsModel, (post) => post.author)
    posts: PostsModel[];
}