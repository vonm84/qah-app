import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import './BirthdayList.css';

export default function BirthdayList() {
  const { language, t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('name, pronouns_en, pronouns_pt, birthday_day, birthday_month')
        .neq('name', 'Admin')
        .not('birthday_day', 'is', null)
        .not('birthday_month', 'is', null);

      if (error) throw error;

      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      const sorted = (data || [])
        .map(m => {
          let daysUntil = getDaysUntil(todayMonth, todayDay, m.birthday_month, m.birthday_day);
          return { ...m, daysUntil };
        })
        .sort((a, b) => a.daysUntil - b.daysUntil);

      setMembers(sorted);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = (todayMonth, todayDay, bMonth, bDay) => {
    const year = new Date().getFullYear();
    const today = new Date(year, todayMonth - 1, todayDay);
    let birthday = new Date(year, bMonth - 1, bDay);
    if (birthday < today) {
      birthday = new Date(year + 1, bMonth - 1, bDay);
    }
    const diff = Math.round((birthday - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getRelativeLabel = (daysUntil) => {
    if (daysUntil === 0) return t('today');
    if (daysUntil === 1) return t('tomorrow');
    if (daysUntil <= 7) return t('in_days').replace('{days}', daysUntil);
    return null;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="birthday-list">
      {members.length === 0 ? (
        <div className="no-birthdays">{t('no_birthday_set')}</div>
      ) : (
        <div className="birthday-items">
          {members.map(member => {
            const pronouns = language === 'en' ? member.pronouns_en : member.pronouns_pt;
            const relativeLabel = getRelativeLabel(member.daysUntil);
            const formattedDate = `${member.birthday_day} ${t(`month_${member.birthday_month}`)}`;

            return (
              <div key={member.name} className={`birthday-item${member.daysUntil === 0 ? ' birthday-today' : ''}`}>
                <div className="birthday-member">
                  <span className="birthday-name">{member.name}</span>
                  {pronouns && <span className="birthday-pronouns">({pronouns})</span>}
                </div>
                <div className="birthday-date-info">
                  <span className="birthday-date">{formattedDate}</span>
                  {relativeLabel && <span className="birthday-relative">{relativeLabel}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
