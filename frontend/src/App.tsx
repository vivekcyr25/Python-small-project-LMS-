import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import MaintenancePage from './pages/MaintenancePage';
import './App.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MaintenancePage />
    </QueryClientProvider>
  );
}

export default App;

