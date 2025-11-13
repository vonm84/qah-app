import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';
import './ManageMembers.css';

export default function ManageMembers() {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!newMemberName.trim()) return;

    try {
      const { error } = await supabase
        .from('members')
        .insert([{ name: newMemberName.trim(), language: 'en' }]);

      if (error) throw error;

      setNewMemberName('');
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member: ' + error.message);
    }
  };

  const handleRemoveMember = async (name) => {
    if (!confirm(`Remove ${name}? This will also remove all their data.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('name', name);

      if (error) throw error;

      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error removing member: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manage-members">
      <h3>{t('members')}</h3>

      <form onSubmit={handleAddMember} className="add-member-form">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          placeholder="New member name..."
        />
        <button type="submit">{t('add_member')}</button>
      </form>

      <div className="members-list">
        {members.map(member => (
          <div key={member.name} className="member-item">
            <span>{member.name}</span>
            <button
              onClick={() => handleRemoveMember(member.name)}
              className="remove-btn"
            >
              {t('remove_member')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
