import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { readinessLevels } from '../../config/readinessLevels';
import '../member/OverallView.css';

export default function PartsGrid() {
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

      // Fetch members (exclude Admin)
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="overall-view">
      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              <th className="song-header">Song</th>
              {members.map(member => (
                <th key={member.name}>{member.name}</th>
              ))}
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

                  return (
                    <td
                      key={member.name}
                      className="part-cell"
                      style={{ backgroundColor: color }}
                      title={hasComment ? assignment.comments : ''}
                    >
                      {partShort}{hasComment && '•'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="legend">
        <h4>Readiness Levels:</h4>
        <div className="legend-items">
          {readinessLevels.map(level => (
            <div key={level.id} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: level.color }}></div>
              <span>{level.en}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
