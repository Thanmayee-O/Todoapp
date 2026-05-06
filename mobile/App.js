import AppNavigator from "./src/navigation/AppNavigator";
import { Provider as PaperProvider } from 'react-native-paper';
import { paperTheme } from './src/theme/theme';

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <AppNavigator />
    </PaperProvider>
  );
}