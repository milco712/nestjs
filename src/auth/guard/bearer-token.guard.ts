import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {AuthService} from "../auth.service";
import {UsersService} from "../../users/users.service";

@Injectable()
export class BearerTokenGuard implements CanActivate {
    constructor(private readonly authService: AuthService,
                private readonly  usersService: UsersService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const rawToken = req.headers['authorization'];
        if (!rawToken) {
            throw new UnauthorizedException('No token provided');
        }
        // bearer 토큰 값만 추출
        const token = this.authService.extractTokenFromHeader(rawToken, true);
        // 토큰 검증 후 payload 반환
        const result = this.authService.verifyToken(token)
        // 유저 정보 가져오기
        const user = await this.usersService.getUserByEmail(result.email)
        // request에 정보 넣기
        req.user = user;
        req.token = token;
        req.tokenType = result.type;
        return true;
    }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const req = context.switchToHttp().getRequest();
        if(req.tokenType !== 'access'){
            throw new UnauthorizedException('No access token');
        }
        return true;
    }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const req = context.switchToHttp().getRequest();
        if(req.tokenType !== 'refresh'){
            throw new UnauthorizedException('No refresh token');
        }
        return true;
    }
}