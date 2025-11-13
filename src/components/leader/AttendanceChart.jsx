import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import './AttendanceChart.css';

export default function AttendanceChart() {
  const { language, t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [dates, setDates] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch members (exclude Admin)
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .neq('name', 'Admin')
        .order('name');

      if (membersError) throw membersError;

      // Fetch upcoming rehearsal dates
      const { data: datesData, error: datesError } = await supabase
        .from('rehearsal_dates')
        .select('*')
        .eq('enabled', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date');

      if (datesError) throw datesError;

      // Fetch all attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*');

      if (attendanceError) throw attendanceError;

      setMembers(membersData || []);
      setDates(datesData || []);

      // Create lookup: attendance[memberName][date] = { status, comment }
      const attendanceMap = {};
      attendanceData?.forEach(a => {
        if (!attendanceMap[a.member_name]) {
          attendanceMap[a.member_name] = {};
        }
        attendanceMap[a.member_name][a.date] = {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', options);
  };

  const getStatusDisplay = (status) => {
    if (!status) return 'N/A';
    const displays = {
      yes: t('yes'),
      no: t('no'),
      maybe: t('maybe')
    };
    return displays[status] || 'N/A';
  };

  const getStatusColor = (status) => {
    const colors = {
      yes: '#27ae60',    // green
      no: '#e74c3c',     // red
      maybe: '#f39c12',  // amber
      null: '#95a5a6'    // grey
    };
    return colors[status] || colors.null;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="attendance-chart">
      <div className="chart-container">
        <table className="chart-table">
          <thead>
            <tr>
              <th className="member-header">Member</th>
              {dates.map(date => (
                <th key={date.date} className="date-header">
                  {formatDate(date.date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.name}>
                <td className="member-name">{member.name}</td>
                {dates.map(date => {
                  const memberAttendance = attendance[member.name]?.[date.date];
                  const status = memberAttendance?.status || null;
                  const comment = memberAttendance?.comment;

                  return (
                    <td
                      key={date.date}
                      className="status-cell"
                      style={{ backgroundColor: getStatusColor(status) }}
                      title={status === 'maybe' && comment ? comment : ''}
                    >
                      {getStatusDisplay(status)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
