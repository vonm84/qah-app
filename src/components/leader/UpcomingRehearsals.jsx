import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { readinessLevels } from '../../config/readinessLevels';
import LongPressTooltip from '../common/LongPressTooltip';
import './UpcomingRehearsals.css';

export default function UpcomingRehearsals() {
  const { language, t } = useLanguage();
  const [rehearsals, setRehearsals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch upcoming rehearsal dates
      const { data: datesData, error: datesError } = await supabase
        .from('rehearsal_dates')
        .select('*')
        .eq('enabled', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date');

      if (datesError) throw datesError;

      // Fetch songs
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .order('name');

      if (songsError) throw songsError;

      // Fetch all attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*');

      if (attendanceError) throw attendanceError;

      // Fetch all part assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('part_assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      // Build rehearsal structure
      const rehearsalsData = datesData.map(date => {
        const dateAttendance = attendanceData.filter(a => a.date === date.date);

        const songsBreakdown = songsData.map(song => {
          const songAssignments = assignmentsData.filter(a => a.song_id === song.id);

          // Group by parts
          const partGroups = {};
          if (song.parts) {
            song.parts.forEach(part => {
              partGroups[part.long] = [];
            });
          }

          songAssignments.forEach(assignment => {
            const memberAttendance = dateAttendance.find(a => a.member_name === assignment.member_name);

            // Skip if no part is assigned or if member is not attending
            if (!assignment.part || !memberAttendance || (memberAttendance.status !== 'yes' && memberAttendance.status !== 'maybe')) {
              return;
            }

            if (!partGroups[assignment.part]) {
              partGroups[assignment.part] = [];
            }

            partGroups[assignment.part].push({
              name: assignment.member_name,
              readiness: assignment.readiness_level,
              status: memberAttendance.status,
              attendanceComment: memberAttendance.comment,
              partComment: assignment.comments
            });
          });

          return {
            song,
            partGroups
          };
        });

        return {
          date: date.date,
          songs: songsBreakdown
        };
      });

      setRehearsals(rehearsalsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', options);
  };

  const getReadinessColor = (levelId) => {
    if (!levelId) return '#333';
    const level = readinessLevels.find(l => l.id === levelId);
    return level ? level.color : '#333';
  };

  const getReadinessText = (levelId) => {
    if (!levelId) return 'No readiness set';
    const level = readinessLevels.find(l => l.id === levelId);
    return level ? level[language] : 'No readiness set';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="upcoming-rehearsals">
      {rehearsals.length === 0 ? (
        <div className="empty-state">No upcoming rehearsals scheduled.</div>
      ) : (
        <div className="rehearsals-list">
          {rehearsals.map(rehearsal => (
            <div key={rehearsal.date} className="rehearsal-section">
              <h2>{formatDate(rehearsal.date)}</h2>

              {rehearsal.songs.map(({ song, partGroups }) => (
                <div key={song.id} className="song-section">
                  <h3>{song.name}</h3>

                  <div className="parts-breakdown">
                    {Object.entries(partGroups).map(([partName, members]) => (
                      <div key={partName} className="part-group">
                        <strong>{partName}:</strong>{' '}
                        {members.length === 0 ? (
                          <span className="no-members">-</span>
                        ) : (
                          members.map((member, idx) => (
                            <span key={idx}>
                              {member.status === 'maybe' ? (
                                <LongPressTooltip
                                  content={`${getReadinessText(member.readiness)}${member.partComment ? '\n\n' + member.partComment : ''}\n\nAttendance: ${member.attendanceComment}`}
                                >
                                  <span
                                    className="member-name maybe"
                                    style={{ color: getReadinessColor(member.readiness) }}
                                  >
                                    ({member.name}{member.partComment && '•'} - "{member.attendanceComment}")
                                  </span>
                                </LongPressTooltip>
                              ) : (
                                <LongPressTooltip
                                  content={`${getReadinessText(member.readiness)}${member.partComment ? '\n\n' + member.partComment : ''}`}
                                >
                                  <span
                                    className="member-name"
                                    style={{ color: getReadinessColor(member.readiness) }}
                                  >
                                    {member.name}{member.partComment && '•'}
                                  </span>
                                </LongPressTooltip>
                              )}
                              {idx < members.length - 1 && ', '}
                            </span>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
