import 'react-native-gesture-handler'; // must be the first import (RN new-arch touch init)
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
