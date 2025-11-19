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
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('pronouns_en, pronouns_pt, status')
        .eq('name', user.name)
        .single();

      if (error) throw error;

      setPronounsEn(data.pronouns_en || '');
      setPronounsPt(data.pronouns_pt || '');
      setStatus(data.status || '');
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
          status: status
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
            placeholder="she/her, he/him, they/them..."
          />
        </div>

        <div className="form-group">
          <label>{t('pronouns_pt')}</label>
          <input
            type="text"
            value={pronounsPt}
            onChange={(e) => setPronounsPt(e.target.value)}
            placeholder="ela/dela, ele/dele, elu/delu..."
          />
        </div>

        <div className="form-group">
          <label>{t('status')}</label>
          <textarea
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder=""
            rows={4}
          />
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
