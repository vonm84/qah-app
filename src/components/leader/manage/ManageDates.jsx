import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { REHEARSAL_DAY } from '../../../config/constants';
import './ManageDates.css';

export default function ManageDates() {
  const { language, t } = useLanguage();
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndGenerateDates();
  }, []);

  const fetchAndGenerateDates = async () => {
    try {
      // Get all dates from database
      const { data: existingDates, error: fetchError } = await supabase
        .from('rehearsal_dates')
        .select('*')
        .order('date');

      if (fetchError) throw fetchError;

      // Generate dates for current month + next month
      const generatedDates = generateRehearsalDates();

      // Merge with existing dates
      const allDates = generatedDates.map(genDate => {
        const existing = existingDates?.find(d => d.date === genDate);
        return {
          date: genDate,
          enabled: existing ? existing.enabled : true,
          isNew: !existing
        };
      });

      // Insert new dates that don't exist
      const newDates = allDates.filter(d => d.isNew);
      if (newDates.length > 0) {
        await supabase
          .from('rehearsal_dates')
          .insert(newDates.map(d => ({ date: d.date, enabled: d.enabled })));
      }

      setDates(allDates);
    } catch (error) {
      console.error('Error managing dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRehearsalDates = () => {
    const dates = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Generate for current month and next month
    for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
      const targetMonth = currentMonth + monthOffset;
      const targetYear = currentYear + Math.floor(targetMonth / 12);
      const adjustedMonth = targetMonth % 12;

      const firstDay = new Date(targetYear, adjustedMonth, 1);
      const lastDay = new Date(targetYear, adjustedMonth + 1, 0);

      let current = new Date(firstDay);

      // Find first Tuesday
      while (current.getDay() !== REHEARSAL_DAY) {
        current.setDate(current.getDate() + 1);
      }

      // Add all Tuesdays in the month
      while (current <= lastDay) {
        if (current >= today) {
          dates.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 7);
      }
    }

    return dates;
  };

  const handleToggleDate = async (date) => {
    const updatedDates = dates.map(d =>
      d.date === date ? { ...d, enabled: !d.enabled } : d
    );

    setDates(updatedDates);

    try {
      const dateObj = updatedDates.find(d => d.date === date);
      const { error } = await supabase
        .from('rehearsal_dates')
        .update({ enabled: dateObj.enabled })
        .eq('date', date);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling date:', error);
      fetchAndGenerateDates();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', options);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manage-dates">
      <h3>{t('rehearsal_dates')}</h3>

      <div className="dates-info">
        <p>Rehearsals are automatically scheduled for every Tuesday.</p>
        <p>You can disable specific dates (e.g., holidays) below.</p>
      </div>

      <div className="dates-list">
        {dates.map(dateObj => (
          <div key={dateObj.date} className={`date-item ${!dateObj.enabled ? 'disabled' : ''}`}>
            <span>{formatDate(dateObj.date)}</span>
            <button
              onClick={() => handleToggleDate(dateObj.date)}
              className={dateObj.enabled ? 'disable-btn' : 'enable-btn'}
            >
              {dateObj.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
