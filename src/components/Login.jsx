import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Login.css';

export default function Login() {
  const { login, checkMemberExists } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState('password'); // password, language, name, profile, confirm
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pronounsEn, setPronounsEn] = useState('');
  const [pronounsPt, setPronounsPt] = useState('');
  const [error, setError] = useState('');
  const [existingMember, setExistingMember] = useState(null);
  const [showNameTakenHint, setShowNameTakenHint] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Just move to language selection - we'll verify password later
    setStep('language');
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setStep('name');
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    try {
      const { exists, member } = await checkMemberExists(name.trim());

      if (exists) {
        setExistingMember(member);
        setStep('confirm');
      } else {
        // New member - show profile screen
        setStep('profile');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Create member with profile data
      await login(password, name.trim(), language, pronounsEn, pronounsPt);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmYes = async () => {
    try {
      await login(password, name.trim(), language);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmNo = () => {
    setName('');
    setExistingMember(null);
    setShowNameTakenHint(true);
    setStep('name');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{t('app_title')}</h1>

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <label>{t('enter_password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit">{t('login')}</button>
          </form>
        )}

        {step === 'language' && (
          <div className="language-selection">
            <h2>{t('choose_language')}</h2>
            <div className="language-buttons">
              <button onClick={() => handleLanguageSelect('en')}>English</button>
              <button onClick={() => handleLanguageSelect('pt')}>Português</button>
            </div>
          </div>
        )}

        {step === 'name' && (
          <form onSubmit={handleNameSubmit}>
            <label>{t('enter_name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <button type="submit">{t('login')}</button>
            {showNameTakenHint && (
              <p className="hint">{t('choose_different_name')}</p>
            )}
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="profile-form-login">
            <h2>{t('your_profile')}</h2>

            <label>{t('pronouns_en')}</label>
            <input
              type="text"
              value={pronounsEn}
              onChange={(e) => setPronounsEn(e.target.value)}
            />

            <label>{t('pronouns_pt')}</label>
            <input
              type="text"
              value={pronounsPt}
              onChange={(e) => setPronounsPt(e.target.value)}
            />

            <button type="submit">{t('login')}</button>
          </form>
        )}

        {step === 'confirm' && (
          <div className="confirm-existing">
            <p>{t('name_exists')}</p>
            <div className="confirm-buttons">
              <button onClick={handleConfirmYes}>{t('yes')}</button>
              <button onClick={handleConfirmNo}>{t('no')}</button>
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
