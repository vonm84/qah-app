import { useLanguage } from '../../contexts/LanguageContext';
import { readinessLevels } from '../../config/readinessLevels';
import '../member/OverallView.css';

// Read-only per-song summary of part counts and readiness counts.
// `assignments` is the lookup: assignments[songId][memberName] = { part, readiness_level, comments }
export default function SongBreakdown({ songs, assignments }) {
  const { language, t } = useLanguage();

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
      if (assignment.part && Object.prototype.hasOwnProperty.call(partCounts, assignment.part)) {
        partCounts[assignment.part]++;
      }

      if (assignment.readiness_level) {
        readinessCounts[assignment.readiness_level]++;
      } else {
        readinessCounts['null']++;
      }
    });

    return { partCounts, readinessCounts };
  };

  return (
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
  );
}
