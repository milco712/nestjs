import {BadRequestException, Injectable} from '@nestjs/common';
import {PaginatePostDto} from "../posts/dto/paginate-post.dto";
import {FindManyOptions, FindOptionsOrder, Repository} from "typeorm";
import {BaseModel} from "./entities/base.entity";
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";
import {FILTER_MAPPER} from "./const/filter-mapper.const";
import {HOST, PROTOCOL} from "./const/env.const";

@Injectable()
export class CommonService {
    paginate<T extends BaseModel>(
        dto: PaginatePostDto,
        repository: Repository<T>,
        overrideFindOptions: FindManyOptions<T> = {},
        path: string
    ){
        if (dto.page){
            return this.pagePagination(dto, repository, overrideFindOptions)
        } else {
            return this.cursorPagination(dto, repository, overrideFindOptions, path)
        }
    }

    private async pagePagination<T extends BaseModel>(
        dto: PaginatePostDto,
        repository: Repository<T>,
        overrideFindOptions: FindManyOptions<T> = {},
    ){
        const findOptions = this.composeFindOptions<T>(dto);
        const [data, count] = await repository.findAndCount({
            ...findOptions,
            ...overrideFindOptions,
        })
        return {
            data,
            total: count,
        }
    }

    private async cursorPagination<T extends BaseModel>(
        dto: PaginatePostDto,
        repository: Repository<T>,
        overrideFindOptions: FindManyOptions<T> = {},
        path: string
    ){
        // id 기반이 아닌 like로 보여주고 싶을수도 있기에 일반화 필요
        const findOptions = this.composeFindOptions<T>(dto)
        const results = await repository.find({
            ...findOptions,
            ...overrideFindOptions
        });
        // cursor: { after: 마지막 id} ex 가져온 12개 중 12번째
        const lastItem = results.length > 0 && results.length === dto.take ? results[results.length-1] : null;
        const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/${path}`);
        if (nextUrl) {
            for (const key of Object.keys(dto)) {
                if (dto[key]) {
                    if (
                        key !== 'where__id__more_than' &&
                        key !== 'where__id__less_than'
                    ) {
                        nextUrl.searchParams.append(key, dto[key]);
                    }
                }
            }

            let key = '';

            if (dto.order__createdAt === 'ASC') {
                key = 'where__id__more_than';
            } else {
                key = 'where__id__less_than';
            }

            nextUrl.searchParams.append(key, lastItem.id.toString());
        }
        // count: 응답 데이터 개수
        // next: 다음 요청에 사용할 url
        return {
            data: results,
            cursor: {after: lastItem?.id ?? null},
            count: results.length,
            next: nextUrl?.toString() ?? null,
        }
    }

    private composeFindOptions<T extends BaseModel>(
        dto: PaginatePostDto,
    ): FindManyOptions<T> {
        // where, order, take, skip(page기반일 때)
        /*
          1) where로 시작하면 필터 로직
          2) order로 시작하면 정렬 로직
          3) 필터 로직이면 __을 기준으로 split
             3-1) 3개 값으로 나뉘면 FILTER_MAPPER에서 해당하는 operator 함수 찾아 적용
             3-2) 2개 값으로 나뉘면 정확한 값을 필터하는 것이기에 operator 없이 적용
          4) order는 3-2와 같이 적용
        */
        let where: FindOptionsWhere<T> = {};
        let order: FindOptionsOrder<T> = {};

        for (const [key, value] of Object.entries(dto)) {
            // key -> where__id__less_than
            // value -> 1

            if (key.startsWith('where__')) {
                where = {
                    ...where,
                    ...this.parseWhereFilter(key, value),
                }
            } else if (key.startsWith('order__')) {
                order = {
                    ...order,
                    ...this.parseWhereFilter(key, value),
                }
            }
        }
        return {
            where,
            order,
            take: dto.take,
            skip: dto.page ? dto.take * (dto.page - 1): 0,
        }
    }
    private parseWhereFilter<T extends BaseModel>(key: string, value: any):
        FindOptionsWhere<T> | FindOptionsOrder<T> {
            const options: FindOptionsWhere<T> = {}
            const split = key.split('__'); // ['where','id','more_than'] or ['where','id']
            if (split.length !== 2 && split.length !== 3) {
                throw new BadRequestException(`__로 split했을 때 길이가 2 또는 3이어야 합니다 - 문제되는 키 ${key}`)
            }
            // where__id = 3
            if (split.length === 2) { // ['where', 'id']
                const [_, field] = split; // field -> id
                options[field] = value // {id: 3}
            } else {
                const [_, field, operator] = split;
                if(operator === 'i_like'){
                    options[field] = FILTER_MAPPER[operator](`%${value}%`)
                }else{
                    options[field] = FILTER_MAPPER[operator](value);
                }
            }
            return options;
    }
}
