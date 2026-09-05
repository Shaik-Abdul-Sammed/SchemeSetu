/**
 * UserProfileContext.jsx — Progressive User Profile Context for SchemeSetu V4
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages citizen profile state used for personalized scheme recommendations.
 * Persists in localStorage ('schemesetu_user_profile') without asking everything upfront.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  name: '',
  state: '',
  district: '',
  occupation: '',
  annualIncome: null,
  projectType: '',
  cost: null,
  education: '',
  category: '',
  gender: '',
  age: null,
  preferredLanguage: 'AUTO',
};

export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('schemesetu_user_profile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('schemesetu_user_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not save user profile:', e);
    }
  }, [profile]);

  /**
   * Update selective fields in profile.
   * e.g. updateProfile({ name: 'Ravi', state: 'Andhra Pradesh' })
   */
  const updateProfile = useCallback((fields) => {
    setProfile((prev) => {
      const updated = { ...prev, ...fields };
      return updated;
    });
  }, []);

  /**
   * Reset profile completely (e.g. user clicks "Delete Profile").
   */
  const clearProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    try {
      localStorage.removeItem('schemesetu_user_profile');
    } catch (_) {}
  }, []);

  /**
   * Determine which required fields are missing for a specific intent/task.
   * Allows progressive profiling (ask missing field one by one).
   */
  const getNextMissingSlot = useCallback((intent = 'DISCOVER_SCHEMES') => {
    if (!profile.name) return 'name';
    if (!profile.state) return 'state';
    if (intent === 'DISCOVER_SCHEMES' || intent === 'CHECK_ELIGIBILITY') {
      if (!profile.occupation && !profile.projectType) return 'occupation';
      if (!profile.annualIncome) return 'annualIncome';
    }
    return null; // All required fields present
  }, [profile]);

  /**
   * Check if minimum profile details are present.
   */
  const hasBasicProfile = Boolean(profile.name && profile.state);

  return (
    <UserProfileContext.Provider value={{
      profile,
      updateProfile,
      clearProfile,
      getNextMissingSlot,
      hasBasicProfile,
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
