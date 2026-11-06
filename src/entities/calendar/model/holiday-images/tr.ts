import type { ImageSourcePropType } from 'react-native';

import {
  newYearImage,
  may1Image,
  trMarchImage,
  trApril23Image,
  trMay19Image,
  trKbImage,
  trJul15Image,
  trAug30Image,
  trOct29Image,
} from './holidayImageAssets';

export const trHolidayImageByKey: Record<string, ImageSourcePropType> = {  '2026-01-01|Yılbaşı Tatili': newYearImage,
  '2026-05-01|Emek ve Dayanışma Günü': may1Image,
  '2027-01-01|Yılbaşı Tatili': newYearImage,
  '2027-03-09|Ramazan Bayramı (1. Gün)': trMarchImage,
  '2027-03-10|Ramazan Bayramı (2. Gün)': trMarchImage,
  '2027-03-11|Ramazan Bayramı (3. Gün)': trMarchImage,
  '2027-04-23|Ulusal Egemenlik ve Çocuk Bayramı': trApril23Image,
  '2027-05-01|Emek ve Dayanışma Günü': may1Image,
  '2027-05-16|Kurban Bayramı (1. Gün)': trKbImage,
  '2027-05-17|Kurban Bayramı (2. Gün)': trKbImage,
  '2027-05-18|Kurban Bayramı (3. Gün)': trKbImage,
  '2027-05-19|Atatürk\'ü Anma, Gençlik ve Spor Bayramı': trMay19Image,
  '2027-07-15|Demokrasi ve Milli Birlik Günü': trJul15Image,
  '2027-08-30|Zafer Bayramı': trAug30Image,
  '2027-10-29|Cumhuriyet Bayramı': trOct29Image,};
