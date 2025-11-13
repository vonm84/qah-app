import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './components/Login';
import MemberDashboard from './components/MemberDashboard';
import LeaderDashboard from './components/LeaderDashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (user.isAdmin) {
    return <LeaderDashboard />;
  }

  return <MemberDashboard />;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
