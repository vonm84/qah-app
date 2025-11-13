import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { readinessLevels } from '../../config/readinessLevels';
import './YourParts.css';

export default function YourParts() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [songs, setSongs] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch songs
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .order('name');

      if (songsError) throw songsError;

      // Fetch member's current assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('part_assignments')
        .select('*')
        .eq('member_name', user.name);

      if (assignmentsError) throw assignmentsError;

      setSongs(songsData || []);

      // Convert assignments array to object for easy lookup
      const assignmentsMap = {};
      assignmentsData?.forEach(a => {
        assignmentsMap[a.song_id] = {
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

  const handlePartChange = async (songId, field, value) => {
    const currentAssignment = assignments[songId] || {};
    const newAssignment = { ...currentAssignment, [field]: value };

    // Update local state immediately
    setAssignments(prev => ({
      ...prev,
      [songId]: newAssignment
    }));

    // Update database
    try {
      const { error } = await supabase
        .from('part_assignments')
        .upsert({
          member_name: user.name,
          song_id: songId,
          part: newAssignment.part || null,
          readiness_level: newAssignment.readiness_level || null,
          comments: newAssignment.comments || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'member_name,song_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating assignment:', error);
      // Revert on error
      fetchData();
    }
  };

  const getSongParts = (song) => {
    if (!song.parts) return [];
    return song.parts;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="your-parts">
      {songs.length === 0 ? (
        <div className="empty-state">No songs configured yet.</div>
      ) : (
        <div className="songs-list">
          {songs.map(song => (
            <div key={song.id} className="song-card">
              <h3>{song.name}</h3>

              <div className="form-group">
                <label>{t('part')}</label>
                <select
                  value={assignments[song.id]?.part || ''}
                  onChange={(e) => handlePartChange(song.id, 'part', e.target.value)}
                >
                  <option value="">Select a part...</option>
                  {getSongParts(song).map((part, idx) => (
                    <option key={idx} value={part.long}>
                      {part.long}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('readiness')}</label>
                <div className="readiness-selector">
                  {readinessLevels.map(level => (
                    <button
                      key={level.id}
                      className={`readiness-btn ${assignments[song.id]?.readiness_level === level.id ? 'active' : ''}`}
                      style={{
                        backgroundColor: assignments[song.id]?.readiness_level === level.id ? level.color : '#f0f0f0',
                        color: assignments[song.id]?.readiness_level === level.id ? 'white' : '#666'
                      }}
                      onClick={() => handlePartChange(song.id, 'readiness_level', level.id)}
                    >
                      {level[language]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>{t('comments')}</label>
                <textarea
                  value={assignments[song.id]?.comments || ''}
                  onChange={(e) => handlePartChange(song.id, 'comments', e.target.value)}
                  placeholder={t('comments')}
                  rows="2"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
