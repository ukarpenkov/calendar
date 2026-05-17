import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CalendarWidgetLayout } from './CalendarWidgetLayout';
import { fetchTodayWidgetData } from './widgetData';

const nameToWidget: Record<string, React.FC<{ data: any }>> = {
  RNWidgetProvider: CalendarWidgetLayout,
};

export async function CalendarWidgetTaskHandler(props: WidgetTaskHandlerProps) {
  const Widget = nameToWidget[props.widgetInfo.widgetName];

  if (!Widget) {
    props.renderWidget(
      <CalendarWidgetLayout data={null} />,
    );
    return;
  }

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await fetchTodayWidgetData();
      props.renderWidget(<Widget data={data} />);
      break;
    }
    case 'WIDGET_CLICK': {
      // Click handled by the click action on the widget itself
      break;
    }
    case 'WIDGET_DELETED': {
      break;
    }
  }
}
