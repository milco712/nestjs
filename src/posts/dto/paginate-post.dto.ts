import {IsIn, IsNumber, IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";
import {BasePaginationDto} from "../../common/dto/base-pagination.dto";

export class PaginatePostDto extends BasePaginationDto{
    @IsNumber()
    @IsOptional()
    where__likeCount__more_than: number;

    @IsString()
    @IsOptional()
    where__title__i_like: string;
}