import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import YourParts from './member/YourParts';
import Attendance from './member/Attendance';
import OverallView from './member/OverallView';
import YourProfile from './member/YourProfile';
import './MemberDashboard.css';

export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('parts');

  return (
    <div className="dashboard">
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
          className={activeTab === 'parts' ? 'active' : ''}
          onClick={() => setActiveTab('parts')}
        >
          {t('your_parts')}
        </button>
        <button
          className={activeTab === 'attendance' ? 'active' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          {t('your_attendance')}
        </button>
        <button
          className={activeTab === 'overall' ? 'active' : ''}
          onClick={() => setActiveTab('overall')}
        >
          {t('overall_view')}
        </button>
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          {t('your_profile')}
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'parts' && <YourParts />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'overall' && <OverallView />}
        {activeTab === 'profile' && <YourProfile />}
      </main>
    </div>
  );
}
