import { PictureFlowConfiguration } from './environment.model';
import { environmentPartial } from './environment.shared';

export const environment: PictureFlowConfiguration = {
  production: true,
  ...environmentPartial,
};
