import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';
import './ManageSongs.css';

export default function ManageSongs() {
  const { t } = useLanguage();
  const [songs, setSongs] = useState([]);
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('name');

      if (error) throw error;
      setSongs(data || []);

      // Generate CSV representation
      const csv = generateCSV(data || []);
      setCsvText(csv);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (songsData) => {
    if (songsData.length === 0) {
      return 'Song Name,Part1_Long,Part1_Short,Part2_Long,Part2_Short,Part3_Long,Part3_Short,Part4_Long,Part4_Short';
    }

    const lines = songsData.map(song => {
      const parts = song.parts || [];
      const partCells = parts.flatMap(p => [p.long, p.short]);
      return [song.name, ...partCells].join(',');
    });

    return ['Song Name,Part1_Long,Part1_Short,Part2_Long,Part2_Short,Part3_Long,Part3_Short,Part4_Long,Part4_Short', ...lines].join('\n');
  };

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const dataLines = lines.slice(1); // Skip header

    return dataLines.map(line => {
      const cells = line.split(',').map(c => c.trim());
      const songName = cells[0];
      const parts = [];

      for (let i = 1; i < cells.length; i += 2) {
        const long = cells[i];
        const short = cells[i + 1];
        if (long && short) {
          parts.push({ long, short });
        }
      }

      return { name: songName, parts };
    });
  };

  const handleSaveCSV = async () => {
    try {
      const parsed = parseCSV(csvText);
      const parsedNames = parsed.map(s => s.name);

      // Get current songs to determine what to update/delete/insert
      const { data: currentSongs, error: fetchError } = await supabase
        .from('songs')
        .select('id, name');

      if (fetchError) throw fetchError;

      const currentByName = {};
      currentSongs?.forEach(s => { currentByName[s.name] = s.id; });

      // Songs to delete (exist in DB but not in new CSV)
      const toDelete = currentSongs?.filter(s => !parsedNames.includes(s.name)) || [];

      // Songs to update (exist in both)
      const toUpdate = parsed.filter(s => currentByName[s.name]);

      // Songs to insert (new in CSV)
      const toInsert = parsed.filter(s => !currentByName[s.name]);

      // Delete removed songs (this will cascade delete their assignments)
      if (toDelete.length > 0) {
        const deleteIds = toDelete.map(s => s.id);
        const { error: deleteError } = await supabase
          .from('songs')
          .delete()
          .in('id', deleteIds);
        if (deleteError) throw deleteError;
      }

      // Update existing songs (preserves IDs and assignments!)
      for (const song of toUpdate) {
        const { error: updateError } = await supabase
          .from('songs')
          .update({ parts: song.parts })
          .eq('id', currentByName[song.name]);
        if (updateError) throw updateError;
      }

      // Insert new songs
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('songs')
          .insert(toInsert.map(song => ({
            name: song.name,
            parts: song.parts
          })));
        if (insertError) throw insertError;
      }

      alert('Songs updated successfully!');
      fetchSongs();
    } catch (error) {
      console.error('Error updating songs:', error);
      alert('Error updating songs: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manage-songs">
      <h3>{t('songs')}</h3>

      <div className="csv-instructions">
        <p>Edit the CSV below to manage songs and their parts. Format:</p>
        <code>Song Name, Part1_Long, Part1_Short, Part2_Long, Part2_Short, ...</code>
      </div>

      <textarea
        className="csv-editor"
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        rows="15"
      />

      <button onClick={handleSaveCSV} className="save-btn">
        {t('save')} {t('songs')}
      </button>

      <div className="current-songs">
        <h4>Current Songs ({songs.length})</h4>
        <ul>
          {songs.map(song => (
            <li key={song.id}>
              <strong>{song.name}</strong>
              {' - '}
              {song.parts?.map(p => p.short).join(', ')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
