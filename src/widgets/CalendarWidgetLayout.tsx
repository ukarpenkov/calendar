import React from 'react';
import { FlexWidget, TextWidget, OverlapWidget, ImageWidget } from 'react-native-android-widget';
import type { WidgetDayData } from './widgetData';
import type { AppLanguage } from '../shared/lib/i18n';

const WORK_HOURS_LABELS: Record<AppLanguage, (hours: number) => string> = {
  en: (h) => `Working hours: ${h}h`,
  ru: (h) => `Рабочие часы: ${h}ч`,
  tr: (h) => `Çalışma saatleri: ${h}sa`,
  id: (h) => `Jam kerja: ${h}j`,
  ja: (h) => `勤務時間: ${h}時間`,
};

const OPEN_APP_LABELS: Record<AppLanguage, string> = {
  en: 'Open the app to load calendar',
  ru: 'Откройте приложение для загрузки календаря',
  tr: 'Takvimi yüklemek için uygulamayı açın',
  id: 'Buka aplikasi untuk memuat kalender',
  ja: 'カレンダーを読み込むにはアプリを開いてください',
};

function formatDate(data: WidgetDayData): string {
  const { language, dayNumber, monthLabel, year, weekdayLabel } = data;

  if (language === 'ja') {
    return `${year}年${monthLabel}${dayNumber}日 (${weekdayLabel})`;
  }

  return `${dayNumber} ${monthLabel} ${year}, ${weekdayLabel}`;
}

interface CalendarWidgetProps {
  data: WidgetDayData | null;
}

export function CalendarWidgetLayout({ data }: CalendarWidgetProps) {
  if (!data) {
    return (
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          backgroundColor: '#1a1a2e',
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
          }}
        />
      </FlexWidget>
    );
  }

  const dateText = formatDate(data);
  const workHoursLabelFn = WORK_HOURS_LABELS[data.language] ?? WORK_HOURS_LABELS.en;
  const workHoursText = workHoursLabelFn(data.workHours);

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: '#1a1a2e',
        flexDirection: 'column',
      }}
    >
      {/* Image section with date overlay */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flex: 1,
        }}
      >
        <OverlapWidget
          style={{
            width: 'match_parent',
            height: 'match_parent',
          }}
        >
          <ImageWidget
            image={data.imageResourceName as any}
            imageWidth={500}
            imageHeight={300}
            style={{
              width: 'match_parent',
              height: 'match_parent',
            }}
          />
          {/* Date overlay at bottom of image */}
          <FlexWidget
            style={{
              width: 'match_parent',
              height: 'wrap_content',
              justifyContent: 'flex-end',
              padding: 12,
            }}
          >
            <TextWidget
              text={dateText}
              style={{
                fontSize: 20,
                color: '#ffffff',
                fontWeight: 'bold',
                textShadowColor: '#000000',
                textShadowRadius: 4,
                textShadowOffset: { height: 1, width: 1 },
              }}
            />
          </FlexWidget>
        </OverlapWidget>
      </FlexWidget>

      {/* Info section below image */}
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'wrap_content',
          flexDirection: 'column',
          padding: 12,
          backgroundColor: '#16213e',
        }}
      >
        <TextWidget
          text={workHoursText}
          style={{
            fontSize: 14,
            color: '#a0a0b0',
          }}
        />
        {data.holidayName ? (
          <TextWidget
            text={data.holidayName}
            style={{
              fontSize: 15,
              color: '#e94560',
              fontWeight: 'bold',
            }}
            maxLines={2}
            truncate="END"
          />
        ) : null}
      </FlexWidget>
    </FlexWidget>
  );
}
