import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { REHEARSAL_DAY } from '../../config/constants';
import './Attendance.css';

export default function Attendance() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rehearsalDates, setRehearsalDates] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMaybeModal, setShowMaybeModal] = useState(null);
  const [maybeComment, setMaybeComment] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

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

      // Find first rehearsal day of the month
      while (current.getDay() !== REHEARSAL_DAY) {
        current.setDate(current.getDate() + 1);
      }

      // Add all rehearsal days in the month
      while (current <= lastDay) {
        if (current >= today) {
          dates.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 7);
      }
    }

    return dates;
  };

  const ensureDatesExist = async () => {
    try {
      // Get existing dates from database
      const { data: existingDates } = await supabase
        .from('rehearsal_dates')
        .select('date');

      const existingDateSet = new Set(existingDates?.map(d => d.date) || []);

      // Generate dates for current + next month
      const generatedDates = generateRehearsalDates();

      // Find new dates that don't exist yet
      const newDates = generatedDates.filter(date => !existingDateSet.has(date));

      // Insert new dates (enabled by default)
      if (newDates.length > 0) {
        await supabase
          .from('rehearsal_dates')
          .insert(newDates.map(date => ({ date, enabled: true })));
      }
    } catch (error) {
      console.error('Error ensuring dates exist:', error);
    }
  };

  const fetchData = async () => {
    try {
      // Ensure dates exist for current + next month
      await ensureDatesExist();

      // Fetch enabled rehearsal dates
      const { data: datesData, error: datesError } = await supabase
        .from('rehearsal_dates')
        .select('*')
        .eq('enabled', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date');

      if (datesError) throw datesError;

      // Fetch member's attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_name', user.name);

      if (attendanceError) throw attendanceError;

      setRehearsalDates(datesData || []);

      // Convert attendance array to object for easy lookup
      const attendanceMap = {};
      attendanceData?.forEach(a => {
        attendanceMap[a.date] = {
          status: a.status,
          comment: a.comment
        };
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (date, status) => {
    if (status === 'maybe') {
      setShowMaybeModal(date);
      setMaybeComment(attendance[date]?.comment || '');
      return;
    }

    await updateAttendance(date, status, null);
  };

  const handleMaybeSubmit = async () => {
    if (!maybeComment.trim()) {
      alert(t('explain_maybe'));
      return;
    }

    await updateAttendance(showMaybeModal, 'maybe', maybeComment);
    setShowMaybeModal(null);
    setMaybeComment('');
  };

  const updateAttendance = async (date, status, comment) => {
    // Update local state immediately
    setAttendance(prev => ({
      ...prev,
      [date]: { status, comment }
    }));

    // Update database
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          member_name: user.name,
          date: date,
          status: status,
          comment: comment,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'member_name,date'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating attendance:', error);
      fetchData();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(t === 'pt' ? 'pt-BR' : 'en-US', options);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="attendance-view">
      {rehearsalDates.length === 0 ? (
        <div className="empty-state">No upcoming rehearsals scheduled.</div>
      ) : (
        <div className="dates-list">
          {rehearsalDates.map(rehearsal => (
            <div key={rehearsal.date} className="date-card">
              <div className="date-header">{formatDate(rehearsal.date)}</div>
              <div className="attendance-options">
                <label className={attendance[rehearsal.date]?.status === 'yes' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name={`attendance-${rehearsal.date}`}
                    checked={attendance[rehearsal.date]?.status === 'yes'}
                    onChange={() => handleAttendanceChange(rehearsal.date, 'yes')}
                  />
                  <span>{t('yes')}</span>
                </label>
                <label className={attendance[rehearsal.date]?.status === 'no' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name={`attendance-${rehearsal.date}`}
                    checked={attendance[rehearsal.date]?.status === 'no'}
                    onChange={() => handleAttendanceChange(rehearsal.date, 'no')}
                  />
                  <span>{t('no')}</span>
                </label>
                <label className={attendance[rehearsal.date]?.status === 'maybe' ? 'selected' : ''}>
                  <input
                    type="radio"
                    name={`attendance-${rehearsal.date}`}
                    checked={attendance[rehearsal.date]?.status === 'maybe'}
                    onChange={() => handleAttendanceChange(rehearsal.date, 'maybe')}
                  />
                  <span>{t('maybe')}</span>
                </label>
              </div>
              {attendance[rehearsal.date]?.status === 'maybe' && attendance[rehearsal.date]?.comment && (
                <div className="maybe-comment">
                  {attendance[rehearsal.date].comment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showMaybeModal && (
        <div className="modal-overlay" onClick={() => setShowMaybeModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('explain_maybe')}</h3>
            <textarea
              value={maybeComment}
              onChange={(e) => setMaybeComment(e.target.value)}
              rows="4"
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleMaybeSubmit}>{t('save')}</button>
              <button onClick={() => setShowMaybeModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
