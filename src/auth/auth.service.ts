import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {UsersModel} from "../users/entities/users.entity";
import {HASH_ROUNDS, JWT_SECRET} from "./const/auth.const";
import {UsersService} from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService
    ) {
    }
    // 1) 계정생성: email, nickname, password로 계정 생성하고, accessToken와 refreshToken 반환
    async regiserWithEmail(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>){
        const hash = await bcrypt.hash(user.password, HASH_ROUNDS);
        const newUser = await this.usersService.createUser({...user, password: hash});
        return this.returnToken(newUser);
    }

    // 2) 로그인: email, password로 사용자 검증하고, accessToken과 refreshToken을 반환
    async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>){
        const existingUser = await this.authenticateWithEmailAndPassword(user)
        return this.returnToken(existingUser)
    }

    // 로그인할 때 basic 또는 baerer 토큰인지 검증하고 토큰만 추출
    extractTokenFromHeader(header: string, isBearer: boolean){
        const splitToken = header.split(" ")
        // basic은 로그인정보 base64로 인코딩, baerer는 jwt토큰
        const prefix = isBearer ? 'Bearer' : 'Basic'

        if (splitToken.length !== 2 || splitToken[0] !== prefix) {
            throw new UnauthorizedException('잘못된 토큰입니다')
        }
        const token = splitToken[1];
        return token;
    }
    // 로그인할 때 받아온 basic 토큰을 디코딩
    decodeBasicToken(base64String: string){
        const decoded = Buffer.from(base64String, 'base64').toString('utf8'); // email:password
        const split = decoded.split(':'); // [email, password]
        if (split.length !== 2){
            throw new UnauthorizedException('잘못된 유형의 토큰입니다')
        }
        const email = split[0];
        const password = split[1];
        return {email, password};
    }
    // 토큰 검증 - JWT_SECRET으로 서명 검증, 만료여부 확인 후 payload 반환
    verifyToken(token: string){
        try {
            return this.jwtService.verify(token,{
                secret: JWT_SECRET
            });
        }catch(e){
            throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰입니다.');
        }

    }
    // accessToken과 refreshToken이 만료될 때마다 새로 발급
    rotateToken(token: string, isRefreshToken: boolean){
        const decoded = this.jwtService.verify(token,{
            secret: JWT_SECRET
        })
        if(decoded.type !== 'refresh'){
            throw new UnauthorizedException('토큰 재발급은 refresh토큰만 가능합니다')
        }
        return this.signToken({
            ...decoded,
        }, isRefreshToken)
    }

    // 3) accessToken과 refreshToken을 생성해서 반환 (1), (2)에서 사용
    returnToken(user: Pick<UsersModel, 'email' | 'id'>){
        return {
            accessToken: this.signToken(user, false),
            refreshToken: this.signToken(user, true),
        }
    }

    // 4) accessToken 또는 refreshToken을 생성(서명) (3)에서 사용
    signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean){
        // payload를 기반으로 토큰을 생성 - payload를 base64로 인코딩 > secret으로 암호화 서명 > 토큰
        // payload에 넣을 정보: email, sub(user id), type(access/refresh)
        const payload = {
            email: user.email,
            sub: user.id,
            type: isRefreshToken ? 'refresh' : 'access',
        }

        return this.jwtService.sign(payload, {
            secret: JWT_SECRET,
            expiresIn: isRefreshToken ? 3600 : 1800
        });
    }

    // 5) 로그인 시 email, password로 사용자 검증 (2)에서 사용 --- email 존재여부와 비밀번호 유효 검사
    async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>){
        const existingUser = await this.usersService.getUserByEmail(user.email);
        if(!existingUser){
            throw new UnauthorizedException('Invalid email');
        }
        const passOK = await bcrypt.compare(user.password, existingUser.password)
        if(!passOK){
            throw new UnauthorizedException('Invalid password');
        }
        return existingUser
    }

    //
}
