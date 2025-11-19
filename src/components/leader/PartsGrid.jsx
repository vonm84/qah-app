import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { readinessLevels } from '../../config/readinessLevels';
import LongPressTooltip from '../common/LongPressTooltip';
import '../member/OverallView.css';

export default function PartsGrid() {
  const { language, t } = useLanguage();
  const [songs, setSongs] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch songs
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .order('name');

      if (songsError) throw songsError;

      // Fetch members (exclude Admin) with profile data
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('name, pronouns_en, pronouns_pt')
        .neq('name', 'Admin')
        .order('name');

      if (membersError) throw membersError;

      // Fetch all assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('part_assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      setSongs(songsData || []);
      setMembers(membersData || []);

      // Create lookup: assignments[songId][memberName] = { part, readiness, comments }
      const assignmentsMap = {};
      assignmentsData?.forEach(a => {
        if (!assignmentsMap[a.song_id]) {
          assignmentsMap[a.song_id] = {};
        }
        assignmentsMap[a.song_id][a.member_name] = {
          part: a.part,
          readiness_level: a.readiness_level,
          comments: a.comments
        };
      });
      setAssignments(assignmentsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPartShort = (song, partLong) => {
    if (!song.parts || !partLong) return '';
    const part = song.parts.find(p => p.long === partLong);
    return part ? part.short : partLong;
  };

  const getReadinessColor = (levelId) => {
    if (!levelId) return '#f0f0f0';
    const level = readinessLevels.find(l => l.id === levelId);
    return level ? level.color : '#f0f0f0';
  };

  const getReadinessText = (levelId) => {
    if (!levelId) return t('not_set');
    const level = readinessLevels.find(l => l.id === levelId);
    return level ? level[language] : t('not_set');
  };

  const getSongBreakdown = (song) => {
    const songAssignments = assignments[song.id] || {};

    // Count by part
    const partCounts = {};
    if (song.parts) {
      song.parts.forEach(part => {
        partCounts[part.long] = 0;
      });
    }

    // Count by readiness level
    const readinessCounts = {};
    readinessLevels.forEach(level => {
      readinessCounts[level.id] = 0;
    });
    readinessCounts['null'] = 0; // for not set

    Object.values(songAssignments).forEach(assignment => {
      // Count parts
      if (assignment.part && partCounts.hasOwnProperty(assignment.part)) {
        partCounts[assignment.part]++;
      }

      // Count readiness
      if (assignment.readiness_level) {
        readinessCounts[assignment.readiness_level]++;
      } else {
        readinessCounts['null']++;
      }
    });

    return { partCounts, readinessCounts };
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="overall-view">
      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th className="song-header">{t('song')}</th>
              {members.map(member => {
                const pronouns = language === 'en' ? member.pronouns_en : member.pronouns_pt;

                return (
                  <th key={member.name} className="member-header-cell">
                    <div className="member-name-wrapper">
                      <div className="member-name-main">{member.name}</div>
                      {pronouns && <div className="member-pronouns">{pronouns}</div>}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id}>
                <td className="song-name">{song.name}</td>
                {members.map(member => {
                  const assignment = assignments[song.id]?.[member.name];
                  const partShort = getPartShort(song, assignment?.part);
                  const color = getReadinessColor(assignment?.readiness_level);
                  const hasComment = assignment?.comments;

                  const cellContent = (
                    <td
                      key={member.name}
                      className="part-cell"
                      style={{ backgroundColor: color }}
                    >
                      {partShort}{hasComment && '•'}
                    </td>
                  );

                  return hasComment ? (
                    <LongPressTooltip key={member.name} content={assignment.comments}>
                      {cellContent}
                    </LongPressTooltip>
                  ) : (
                    cellContent
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="legend">
        <h4>{t('readiness_levels')}</h4>
        <div className="legend-items">
          {readinessLevels.map(level => (
            <div key={level.id} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: level.color }}></div>
              <span>{level[language]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="breakdown-section">
        <h4>{t('breakdown')}</h4>
        {songs.map(song => {
          const { partCounts, readinessCounts } = getSongBreakdown(song);

          return (
            <div key={song.id} className="song-breakdown">
              <h5>{song.name}</h5>

              <div className="breakdown-subsection">
                <strong>{t('parts')}</strong>
                {Object.entries(partCounts).map(([part, count]) => (
                  <div key={part} className="breakdown-line">
                    {part} - {count}
                  </div>
                ))}
              </div>

              <div className="breakdown-subsection">
                <strong>{t('readiness_breakdown')}</strong>
                {readinessLevels.map((level) => (
                  readinessCounts[level.id] > 0 && (
                    <div key={level.id} className="breakdown-line readiness-item">
                      <span className="readiness-color-square" style={{ backgroundColor: level.color }}></span>
                      {level[language]} - {readinessCounts[level.id]}
                    </div>
                  )
                ))}
                {readinessCounts['null'] > 0 && (
                  <div className="breakdown-line readiness-item">
                    <span className="readiness-color-square" style={{ backgroundColor: '#f0f0f0' }}></span>
                    {t('not_set')} - {readinessCounts['null']}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
