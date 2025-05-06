import {BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthService} from "../auth.service";

@Injectable()
export class BasicTokenGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const rawToken = req.headers['authorization'];
        if (!rawToken) {
            throw new UnauthorizedException('No token provided');
        }
        // basic 토큰값만 추출
        const token = await this.authService.extractTokenFromHeader(rawToken, false)
        // basic 토큰에서 email, password 추출
        const {email, password} = this.authService.decodeBasicToken(token)
        // email, password이 db에 있는지 확인하고 유저정보 가져옴
        const user = await this.authService.authenticateWithEmailAndPassword({email, password})
        // 찾아낸 유저를 요청 객체이 붙여줌
        req.user = user;
        return true;
    }
}