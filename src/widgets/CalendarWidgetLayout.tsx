/* eslint-disable react-native/no-inline-styles -- react-native-android-widget Flex/Image/Text DSL */
import React from 'react';
import { FlexWidget, TextWidget, OverlapWidget, ImageWidget } from 'react-native-android-widget';
import type { WidgetDayData } from './widgetData';
import type { AppLanguage } from '../shared/lib/i18n';
import { WIDGET_DEFAULT_IMAGE_BY_MONTH } from './imageMapping';

const WIDGET_CORNER_RADIUS = 16;

/** Прозрачный корень виджета: видна подложка лаунчера по краям скругления. */
const TRANSPARENT: `#${string}` = '#00000000';

function placeholderImageResourceName(): string {
  const month = new Date().getMonth() + 1;
  return WIDGET_DEFAULT_IMAGE_BY_MONTH[month] ?? 'day_work_default';
}

const OPEN_APP_LABELS: Record<AppLanguage, string> = {
  en: 'Open the app to load calendar',
  ru: 'Откройте приложение для загрузки календаря',
  tr: 'Takvimi yüklemek için uygulamayı açın',
  id: 'Buka aplikasi untuk memuat kalender',
  ja: 'カレンダーを読み込むにはアプリを開いてください',
};

const WEEKEND_LABELS: Record<AppLanguage, string> = {
  ru: 'Выходной',
  en: 'Day off',
  tr: 'Tatil',
  id: 'Libur',
  ja: '休日',
};

const WORKDAY_LABELS: Record<AppLanguage, string> = {
  ru: 'Рабочий день',
  en: 'Workday',
  tr: 'İş günü',
  id: 'Hari kerja',
  ja: '平日',
};

const SHORTENED_LABELS: Record<AppLanguage, string> = {
  ru: 'Сокращённый день',
  en: 'Shortened day',
  tr: 'Kısaltılmış iş günü',
  id: 'Hari kerja pendek',
  ja: '短時間勤務の日',
};

const HOLIDAY_FALLBACK_LABELS: Record<AppLanguage, string> = {
  ru: 'Праздник',
  en: 'Holiday',
  tr: 'Resmi tatil',
  id: 'Hari libur nasional',
  ja: '祝日',
};

const VACATION_LABELS: Record<AppLanguage, string> = {
  ru: 'Отпуск',
  en: 'Vacation',
  tr: 'Tatil',
  id: 'Liburan',
  ja: '休暇',
};

const TEXT_SHADOW = {
  textShadowColor: '#000000',
  textShadowRadius: 4,
  textShadowOffset: { height: 1, width: 1 },
} as const;

function formatDate(data: WidgetDayData): string {
  const { language, dayNumber, monthLabel, year, weekdayLabel } = data;

  if (language === 'ja') {
    return `${year}年${monthLabel}${dayNumber}日 (${weekdayLabel})`;
  }

  return `${dayNumber} ${monthLabel} ${year}, ${weekdayLabel}`;
}

function getDayCaption(data: WidgetDayData): string {
  const lang = data.language;

  if (data.isOnVacation) {
    return VACATION_LABELS[lang] ?? VACATION_LABELS.en;
  }

  if (data.holidayName) {
    return data.holidayName;
  }

  if (data.dayType === 'holiday') {
    return HOLIDAY_FALLBACK_LABELS[lang] ?? HOLIDAY_FALLBACK_LABELS.en;
  }

  if (data.dayType === 'weekend') {
    return WEEKEND_LABELS[lang] ?? WEEKEND_LABELS.en;
  }

  if (data.dayType === 'shortened' || data.isShortened) {
    return SHORTENED_LABELS[lang] ?? SHORTENED_LABELS.en;
  }

  return WORKDAY_LABELS[lang] ?? WORKDAY_LABELS.en;
}

interface CalendarWidgetProps {
  data: WidgetDayData | null;
}

export function CalendarWidgetLayout({ data }: CalendarWidgetProps) {
  if (!data) {
    const placeholder = placeholderImageResourceName();
    return (
      <OverlapWidget
        clickAction="OPEN_APP"
        style={{
          width: 'match_parent',
          height: 'match_parent',
          borderRadius: WIDGET_CORNER_RADIUS,
          overflow: 'hidden',
          backgroundColor: TRANSPARENT,
        }}
      >
        <FlexWidget
          style={{
            width: 'match_parent',
            height: 'match_parent',
            justifyContent: 'flex-end',
          }}
        >
          <ImageWidget
            image={placeholder as any}
            imageWidth={420}
            imageHeight={180}
            radius={WIDGET_CORNER_RADIUS}
            style={{
              width: 'match_parent',
              height: 'wrap_content',
            }}
          />
        </FlexWidget>
        <FlexWidget
          style={{
            width: 'match_parent',
            height: 'match_parent',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <TextWidget
            text={OPEN_APP_LABELS.en}
            style={{
              fontSize: 14,
              color: '#ffffff',
              textAlign: 'center',
              ...TEXT_SHADOW,
            }}
          />
        </FlexWidget>
      </OverlapWidget>
    );
  }

  const captionText = getDayCaption(data);
  const dateText = formatDate(data);

  return (
    <OverlapWidget
      clickAction="OPEN_APP"
      style={{
        width: 'match_parent',
        height: 'match_parent',
        borderRadius: WIDGET_CORNER_RADIUS,
        overflow: 'hidden',
        backgroundColor: TRANSPARENT,
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          justifyContent: 'flex-end',
        }}
      >
        <ImageWidget
          image={data.imageResourceName as any}
          imageWidth={420}
          imageHeight={180}
          radius={WIDGET_CORNER_RADIUS}
          style={{
            width: 'match_parent',
            height: 'wrap_content',
          }}
        />
      </FlexWidget>
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          justifyContent: 'flex-end',
          paddingLeft: 12,
          paddingRight: 12,
          paddingBottom: 21,
          paddingTop: 12,
        }}
      >
        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'column',
          }}
        >
          <TextWidget
            text={captionText}
            style={{
              fontSize: 18,
              color: '#ffffff',
              fontWeight: 'bold',
              ...TEXT_SHADOW,
            }}
            maxLines={3}
            truncate="END"
          />
          <TextWidget
            text={dateText}
            style={{
              fontSize: 14,
              color: '#f0f0f0',
              marginTop: 4,
              ...TEXT_SHADOW,
            }}
            maxLines={2}
            truncate="END"
          />
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}
