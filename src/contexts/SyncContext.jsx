import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, fetchCloudProfiles, syncProfileToCloud } from '../firebase';

const SyncContext = createContext();

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('offline');
  const [syncToast, setSyncToast] = useState(null);
  const [syncRequestedProfile, setSyncRequestedProfile] = useState(null);

  useEffect(() => {
    if (typeof auth === 'undefined' || !auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setSyncStatus('syncing');
        try {
          const cloudProfiles = await fetchCloudProfiles(u.uid);
          const saved = localStorage.getItem('jd_profiles');
          let prev = saved ? JSON.parse(saved) : [];
          if (!Array.isArray(prev)) prev = [];
          
          const mergedMap = new Map();
          
          const mergeIn = (profilesArray) => {
            profilesArray.forEach(p => {
              const key = p.id || (p.name || 'User').toLowerCase();
              const existing = mergedMap.get(key);
              if (!existing || (p.updatedAt || 0) > (existing.updatedAt || 0)) {
                mergedMap.set(key, { ...p, id: p.id || key, updatedAt: p.updatedAt || Date.now() });
              }
            });
          };

          if (cloudProfiles && Array.isArray(cloudProfiles)) mergeIn(cloudProfiles);
          mergeIn(prev);
          
          const newProfiles = Array.from(mergedMap.values()).sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0)).slice(0, 15);
          
          if (newProfiles.length > 0) {
            localStorage.setItem('jd_profiles', JSON.stringify(newProfiles));
            
            const success = await syncProfileToCloud(u.uid, newProfiles);
            setSyncStatus(success ? 'synced' : 'error');
            
            // Only toast if the merged payload is significantly different from what was locally there
            if (cloudProfiles && cloudProfiles.length > 0) {
               const newlyMergedCount = newProfiles.length - prev.length;
               if (newlyMergedCount > 0) {
                 setSyncToast(`☁️ Securely synchronized your Cloud Vault.`);
                 setTimeout(() => setSyncToast(null), 5000);
               }
            }
            
            const activeProfiles = newProfiles.filter(p => !p.isDeleted);
            if (activeProfiles.length > 0) {
              setSyncRequestedProfile(activeProfiles[0]);
            }
          } else {
            setSyncStatus('synced');
          }
        } catch (e) { 
          console.error("Cloud sync failed", e); 
          setSyncStatus('error');
        }
      } else {
        setUser(null);
        setSyncStatus('offline');
      }
    });
    return () => unsub();
  }, []);

  const forceSync = async (profilesToSync) => {
    if(!user) return;
    const targets = Array.isArray(profilesToSync) ? profilesToSync : JSON.parse(localStorage.getItem('jd_profiles') || '[]');
    setSyncStatus('syncing');
    const success = await syncProfileToCloud(user.uid, targets);
    setSyncStatus(success ? 'synced' : 'error');
  };

  const deleteProfile = async (profileToDelete) => {
    if (!profileToDelete) return false;
    const newProfiles = [...(JSON.parse(localStorage.getItem('jd_profiles') || '[]'))];
    const idx = newProfiles.findIndex(x => (x.id === profileToDelete.id) || ((x.name || 'User').toLowerCase() === (profileToDelete.name || 'User').toLowerCase()));
    
    if (idx !== -1) {
      newProfiles[idx].isDeleted = true;
      newProfiles[idx].updatedAt = Date.now();
      
      localStorage.setItem('jd_profiles', JSON.stringify(newProfiles));
      
      if (user) {
        setSyncStatus('syncing');
        const success = await syncProfileToCloud(user.uid, newProfiles);
        setSyncStatus(success ? 'synced' : 'error');
      }
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('jd_profiles_updated'));
      }
      
      return true;
    }
    return false;
  };

  const saveProfile = async (inp) => {
    const saved = localStorage.getItem('jd_profiles');
    let prev = [];
    try {
      if (saved) prev = JSON.parse(saved);
      if (!Array.isArray(prev)) prev = [];
    } catch (err) {
      console.warn('Recovered corrupted jd_profiles in localStorage.');
      prev = [];
    }
    
    // Inject immutable UUID if it doesn't exist (with safe HTTP fallback)
    const generateId = () => (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') ? window.crypto.randomUUID() : (Math.random().toString(36).substr(2, 9) + Date.now().toString(36));
    const finalId = inp.id || generateId();
    const newInp = { ...inp, id: finalId, updatedAt: Date.now() };
    
    // Remove the old version matching this ID (or fallback name matching for incredibly old charts)
    const withoutCurrent = prev.filter(p => p.id !== finalId && (p.name || 'User').toLowerCase() !== (newInp.name || 'User').toLowerCase());
    
    const newProfiles = [newInp, ...withoutCurrent].slice(0, 15);
    localStorage.setItem('jd_profiles', JSON.stringify(newProfiles));
    
    if (user && user.uid) {
      setSyncStatus('syncing');
      const success = await syncProfileToCloud(user.uid, newProfiles);
      setSyncStatus(success ? 'synced' : 'error');
    }
  };

  const clearSyncProfile = () => setSyncRequestedProfile(null);

  const logoutUser = () => {
     if (auth) auth.signOut();
     setUser(null);
     setSyncStatus('offline');
  };

  const value = {
    user,
    setUser,
    syncStatus,
    syncToast,
    syncRequestedProfile,
    clearSyncProfile,
    forceSync,
    deleteProfile,
    saveProfile,
    logoutUser
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
};
