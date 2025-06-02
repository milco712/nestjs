import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // 요청이 들어올 때 REQ 요청이 들어온 타임스탬프를 찍는다. [REQ] {요청 path} {요청 시간}
    // 요청이 끝날 때 다시 타임 스탬프를 찍는다. [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}
    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl; // /posts /common/image...
    const now = new Date();
    console.log(`[REQ] ${path} ${now.toLocaleTimeString('kr')}`);

    // next.handle() 실행하면 라우트 로직 실행되고 응답이 반환됨 observable로
    return next.handle().pipe(
      // 모니터링하는 pipe에는 rxjx 함수를 무한음으로 넣을 수 있음, 응답에 대해 순서대로 실행됨
      tap((observable) =>
        console.log(
          `[RES] ${path} ${new Date().toLocaleTimeString('kr')} ${new Date().getMilliseconds()} - ${now.getMilliseconds()}ms`,
        ),
      ), // 응답으로 전달된 값을 observable으로 받아 모니터링할 수 있음
    );
  }
}
