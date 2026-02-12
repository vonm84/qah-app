import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SITE_PASSWORD, ADMIN_USERNAME } from '../config/constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedPassword = localStorage.getItem('choir_site_password');
    const storedName = localStorage.getItem('choir_member_name');

    if (storedPassword === SITE_PASSWORD && storedName) {
      setUser({
        name: storedName,
        isAdmin: storedName === ADMIN_USERNAME
      });
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const verifySitePassword = (password) => {
    return password === SITE_PASSWORD;
  };

  const checkMemberExists = async (name) => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('name', name)
      .single();

    return { exists: !!data, member: data };
  };

  const createMember = async (name, language, pronounsEn = '', pronounsPt = '', birthdayDay = null, birthdayMonth = null) => {
    const { data, error } = await supabase
      .from('members')
      .insert([{
        name,
        language,
        pronouns_en: pronounsEn,
        pronouns_pt: pronounsPt,
        birthday_day: birthdayDay || null,
        birthday_month: birthdayMonth || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const login = async (password, name, language, pronounsEn = '', pronounsPt = '', birthdayDay = null, birthdayMonth = null) => {
    if (!verifySitePassword(password)) {
      throw new Error('Invalid password');
    }

    localStorage.setItem('choir_site_password', password);

    // Check if member exists
    const { exists, member } = await checkMemberExists(name);

    if (!exists) {
      // Create new member with profile data
      await createMember(name, language, pronounsEn, pronounsPt, birthdayDay, birthdayMonth);
    }

    localStorage.setItem('choir_member_name', name);
    setUser({
      name,
      isAdmin: name === ADMIN_USERNAME
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('choir_site_password');
    localStorage.removeItem('choir_member_name');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      checkMemberExists
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
