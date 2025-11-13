import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ManageMembers from './manage/ManageMembers';
import ManageSongs from './manage/ManageSongs';
import ManageDates from './manage/ManageDates';
import './Manage.css';

export default function Manage() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('members');

  return (
    <div className="manage-view">
      <nav className="manage-nav">
        <button
          className={activeSection === 'members' ? 'active' : ''}
          onClick={() => setActiveSection('members')}
        >
          {t('members')}
        </button>
        <button
          className={activeSection === 'songs' ? 'active' : ''}
          onClick={() => setActiveSection('songs')}
        >
          {t('songs')}
        </button>
        <button
          className={activeSection === 'dates' ? 'active' : ''}
          onClick={() => setActiveSection('dates')}
        >
          {t('rehearsal_dates')}
        </button>
      </nav>

      <div className="manage-content">
        {activeSection === 'members' && <ManageMembers />}
        {activeSection === 'songs' && <ManageSongs />}
        {activeSection === 'dates' && <ManageDates />}
      </div>
    </div>
  );
}
