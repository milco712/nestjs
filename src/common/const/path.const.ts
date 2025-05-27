import { join } from 'node:path';
import * as process from 'node:process';

export const PROJECT_ROOT_PATH = process.cwd(); // 서버 프로젝트 루트 폴더 cf_sns
export const PUBLIC_FOLDER_NAME = 'public'; // 외부에서 접근 가능한 파일 모아둔 폴더 이름
export const POSTS_FOLDER_NAME = 'posts'; // 포스트 이미지 저장할 폴더 이름

export const TEMP_FOLDER_NAME = 'temp'; // 임시 폴더 이름

export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME); // /cf_sns/public
export const POST_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, POSTS_FOLDER_NAME); // /cf_sns/public/posts
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POSTS_FOLDER_NAME,
); // /public/posts

export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, TEMP_FOLDER_NAME);
