import { Provider } from 'react-redux';
import { store } from './store';
import { Home } from './screens/Home';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Home />
      </Provider>
    </ErrorBoundary>
  );
}
