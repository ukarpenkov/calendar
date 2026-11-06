import type { ImageSourcePropType } from 'react-native';

import { esHolidayImageByKey } from './es';
import { idHolidayImageByKey } from './id';
import { jaHolidayImageByKey } from './ja';
import { ruHolidayImageByKey } from './ru';
import { trHolidayImageByKey } from './tr';

/** One lookup table. Region files only organize the keys. */
export const countrySpecificHolidayImageByKey: Record<string, ImageSourcePropType> = {
  ...ruHolidayImageByKey,
  ...trHolidayImageByKey,
  ...idHolidayImageByKey,
  ...jaHolidayImageByKey,
  ...esHolidayImageByKey,
};
