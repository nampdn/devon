import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import {useScreens} from 'react-native-screens';
import {App} from '@devon/components/src/components/App';

useScreens();

AppRegistry.registerComponent(appName, () => App);
