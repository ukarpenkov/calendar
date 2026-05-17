/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './src/app/App';
import { name as appName } from './app.json';
import { CalendarWidgetTaskHandler } from './src/widgets/CalendarWidgetTaskHandler';

AppRegistry.registerComponent(appName, () => App);
registerWidgetTaskHandler(CalendarWidgetTaskHandler);
