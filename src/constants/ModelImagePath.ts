import path = require('path');
import { API_PATH } from '../api/configurations/paths';

export enum ModelImagePath {
  SECTION = 'section',
  USER_PROFILE = 'user/profile',
  PRIVATE_CHAT_MESSAGE = 'chat/private',
  COMMENT = 'comment',
}

export const DEFAULT_IMAGE_PATH = 'public/images/';

export const getModelImageUrl = imageName => imageName ? `${API_PATH}/${DEFAULT_IMAGE_PATH}${imageName}` : null;

export const getAbsoluteServerPath = imageName => path.resolve(DEFAULT_IMAGE_PATH + imageName);
