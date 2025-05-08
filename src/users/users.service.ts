import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UsersModel} from "./entities/users.entity";
import {Repository} from "typeorm";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersModel) private readonly usersRepository: Repository<UsersModel>,
    ){}

    async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>){
        // email, nickname 중복 확인
        const nicknameExists = await this.usersRepository.exists({
          where: {nickname: user.nickname,}
        })
        if(nicknameExists){
            throw new BadRequestException('nickname already exists')
        }
        const emailExists = await this.usersRepository.exists({
            where: {email: user.email,}
        })
        if(emailExists){
            throw new BadRequestException('email already exists')
        }

        const userObject = this.usersRepository.create({
            nickname: user.nickname,
            email: user.email,
            password: user.password,
        })
        return this.usersRepository.save(userObject)
    }

    async getAllUsers() {
        return await this.usersRepository.find()
    }

    // auth.service에서 사용
    async getUserByEmail(email: string) {
        return this.usersRepository.findOne({where: {email}})
    }
}
