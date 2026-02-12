import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './YourProfile.css';

export default function YourProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [pronounsEn, setPronounsEn] = useState('');
  const [pronounsPt, setPronounsPt] = useState('');
  const [birthdayDay, setBirthdayDay] = useState('');
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('pronouns_en, pronouns_pt, birthday_day, birthday_month')
        .eq('name', user.name)
        .single();

      if (error) throw error;

      setPronounsEn(data.pronouns_en || '');
      setPronounsPt(data.pronouns_pt || '');
      setBirthdayDay(data.birthday_day || '');
      setBirthdayMonth(data.birthday_month || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({
          pronouns_en: pronounsEn,
          pronouns_pt: pronounsPt,
          birthday_day: birthdayDay || null,
          birthday_month: birthdayMonth || null
        })
        .eq('name', user.name);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="your-profile">
      <div className="profile-form">
        <div className="form-group">
          <label>{t('pronouns_en')}</label>
          <input
            type="text"
            value={pronounsEn}
            onChange={(e) => setPronounsEn(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{t('pronouns_pt')}</label>
          <input
            type="text"
            value={pronounsPt}
            onChange={(e) => setPronounsPt(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{t('your_birthday')}</label>
          <div className="birthday-selects">
            <select
              value={birthdayDay}
              onChange={(e) => setBirthdayDay(e.target.value)}
            >
              <option value="">{t('birthday_day')}</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              value={birthdayMonth}
              onChange={(e) => setBirthdayMonth(e.target.value)}
            >
              <option value="">{t('birthday_month')}</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{t(`month_${month}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : t('save')}
        </button>
      </div>
    </div>
  );
}
