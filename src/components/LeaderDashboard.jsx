import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UpcomingRehearsals from './leader/UpcomingRehearsals';
import AttendanceChart from './leader/AttendanceChart';
import PartsGrid from './leader/PartsGrid';
import Manage from './leader/Manage';
import './LeaderDashboard.css';

export default function LeaderDashboard() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [activeView, setActiveView] = useState('attendance');

  return (
    <div className="dashboard leader-dashboard">
      <header className="dashboard-header">
        <div className="welcome">
          {t('welcome')}, {user.name}!
        </div>
        <div className="header-controls">
          <button className="lang-toggle" onClick={toggleLanguage}>
            {language.toUpperCase()}
          </button>
          <button className="logout-btn" onClick={logout}>×</button>
        </div>
      </header>

      <nav className="tab-nav">
        <button
          className={activeView === 'attendance' ? 'active' : ''}
          onClick={() => setActiveView('attendance')}
        >
          {t('everyones_attendance')}
        </button>
        <button
          className={activeView === 'chart' ? 'active' : ''}
          onClick={() => setActiveView('chart')}
        >
          {t('attendance_chart')}
        </button>
        <button
          className={activeView === 'parts' ? 'active' : ''}
          onClick={() => setActiveView('parts')}
        >
          {t('everyones_parts')}
        </button>
        <button
          className={activeView === 'manage' ? 'active' : ''}
          onClick={() => setActiveView('manage')}
        >
          {t('manage')}
        </button>
      </nav>

      <main className="dashboard-content leader-content">
        {activeView === 'attendance' && <UpcomingRehearsals />}
        {activeView === 'chart' && <AttendanceChart />}
        {activeView === 'parts' && <PartsGrid />}
        {activeView === 'manage' && <Manage />}
      </main>
    </div>
  );
}
