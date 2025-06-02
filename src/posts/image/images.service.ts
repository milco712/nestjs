import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from '../../common/entities/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { basename, join } from 'node:path';
import {
  POST_IMAGE_PATH,
  TEMP_FOLDER_PATH,
} from '../../common/const/path.const';
import { promises } from 'fs';
import { CreatePostImageDto } from './dto/create-image.dto';

@Injectable()
export class PostImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    // dto의 이미지 이름을 기반으로 파일 경로 생성
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);
    try {
      await promises.access(tempFilePath); // 파일 존재하는지 확인
    } catch (e) {
      throw new BadRequestException('존재하지 않는 파일입니다.');
    }
    const fileName = basename(tempFilePath); // 파일 이름만 추출

    const newPath = join(POST_IMAGE_PATH, fileName); // 새로 이동할 포스트 폴더 경로

    const result = await repository.save({ ...dto });

    await promises.rename(tempFilePath, newPath); // 파일 경로 옮기기

    return result;
  }
}
