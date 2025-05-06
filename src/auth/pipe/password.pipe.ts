import {PipeTransform, Injectable, ArgumentMetadata, BadRequestException} from '@nestjs/common'
import {PostsService} from "../../posts/posts.service";

@Injectable()
export class PasswordPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata){
        if(value.toString().length > 8){
            throw new BadRequestException('Password must have at least 8 characters')
        }
        return value.toString()
    }
}

@Injectable()
export class MaxLengthPipe implements PipeTransform {
    constructor(private readonly length: number, private readonly subject: string) {}
    transform(value: any, metadata: ArgumentMetadata){
        if(value.toString().length > this.length){
            throw new BadRequestException(`${this.subject} must not exceed ${this.length} characters`)
        }
        return value.toString()
    }
}
@Injectable()
export class MinLengthPipe implements PipeTransform {
    constructor(private readonly length: number, private readonly subject: string) {}
    transform(value: any, metadata: ArgumentMetadata){
        if(value.toString().length < this.length){
            throw new BadRequestException(`${this.subject} must have at least ${this.length} characters`)
        }
        return value.toString()
    }
}