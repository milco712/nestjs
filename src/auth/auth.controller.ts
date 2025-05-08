import {Body, Controller, Headers, Post, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import {MaxLengthPipe, MinLengthPipe, PasswordPipe} from "./pipe/password.pipe";
import {BasicTokenGuard} from "./guard/basic-token.guard";
import {AccessTokenGuard, RefreshTokenGuard} from "./guard/bearer-token.guard";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    // Bearer refresh 토큰 추출
    const token = this.authService.extractTokenFromHeader(rawToken, true)
    // 새 access token
    const newToken = this.authService.rotateToken(token, false)
    return {accessToken: newToken}
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    // Bearer refresh 토큰 추출
    const token = this.authService.extractTokenFromHeader(rawToken, true)
    // 새 access token
    const newToken = this.authService.rotateToken(token, true)
    return {refreshToken: newToken}
  }

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
      @Headers('authorization') rawToken: string,
  ){
    // basic 토큰 추출
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    // 토큰에서 email, password 추출
    const credentials = this.authService.decodeBasicToken(token)
    return this.authService.loginWithEmail(credentials)
  }

  @Post('register/email')
  postRegisterEmail(
      @Body('nickname') nickname: string,
      @Body('email') email: string,
      @Body('password', new MaxLengthPipe(8, 'Password'), new MinLengthPipe(3, 'Password')) password: string,
  ){
    return this.authService.regiserWithEmail({nickname, email, password})
  }
}
