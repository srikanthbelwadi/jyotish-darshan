import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs, doc, setDoc } from 'firebase/firestore';

export default function SuperAdminDashboard({ user, onBack, lang }) {
  const [usersInfo, setUsersInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    if (!user || user.email !== 'srikanthbelwadi@gmail.com') return;
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('llmTokensRun', 'desc'), limit(50));
      const snap = await getDocs(q);
      const data = [];
      let total = 0;
      snap.forEach(d => {
        const docData = d.data();
        data.push({ id: d.id, ...docData });
        if (docData.llmTokensRun) total += docData.llmTokensRun;
      });
      setUsersInfo(data);
      setTotalTokens(total);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch users. Check Firestore permissions.");
    }
    setLoading(false);
  };

  const toggleBan = async (uid, currentStatus) => {
    const isBanned = currentStatus || false;
    const confirmMsg = isBanned ? "Unban this user?" : "Suspend this user account immediately? They will lose all database access.";
    if (!window.confirm(confirmMsg)) return;

    try {
      await setDoc(doc(db, 'users', uid), { isBanned: !isBanned }, { merge: true });
      setUsersInfo(usersInfo.map(u => u.id === uid ? { ...u, isBanned: !isBanned } : u));
    } catch (e) {
      console.error(e);
      alert("Error suspending user");
    }
  };

  const dollars = (totalTokens / 1000000) * 0.075; // Approx flash pricing

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px 24px', fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <button onClick={onBack} style={{ background: 'transparent', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', marginBottom: 24 }}>
          ← Back to Jyotish Darshan
        </button>

        <h1 style={{ color: 'var(--accent-gold)', fontSize: 32, marginBottom: 8 }}>CPO Analytics Console</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontFamily: 'var(--font-sans)' }}>
          Monitoring total platform generative usage securely.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 40 }}>
          <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Total LLM Tokens Burned</div>
            <div style={{ fontSize: 36, color: 'var(--accent-gold)', marginTop: 8 }}>{totalTokens.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Estimated Compute Cost</div>
            <div style={{ fontSize: 36, color: '#10B981', marginTop: 8 }}>${dollars.toFixed(3)}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: 20, color: 'var(--accent-gold)', marginBottom: 24 }}>Top Authorized Users</h2>
          
          {loading ? <p>Loading telemetry...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-dark)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 12 }}>User ID</th>
                  <th style={{ padding: 12 }}>Sync Check</th>
                  <th style={{ padding: 12 }}>Tokens Burned</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersInfo.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', background: u.isBanned ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                    <td style={{ padding: 12, fontFamily: 'var(--font-mono)' }}>{u.id}</td>
                    <td style={{ padding: 12 }}>{u.lastSynced ? new Date(u.lastSynced).toLocaleString() : 'N/A'}</td>
                    <td style={{ padding: 12, color: 'var(--accent-gold)', fontWeight: 'bold' }}>{u.llmTokensRun?.toLocaleString() || 0}</td>
                    <td style={{ padding: 12 }}>
                      {u.isBanned ? <span style={{ color: '#EF4444' }}>Suspended</span> : <span style={{ color: '#10B981' }}>Active</span>}
                    </td>
                    <td style={{ padding: 12 }}>
                      <button 
                        onClick={() => toggleBan(u.id, u.isBanned)}
                        style={{ background: u.isBanned ? 'transparent' : '#EF4444', border: u.isBanned ? '1px solid #EF4444' : 'none', color: u.isBanned ? '#EF4444' : '#fff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                      >
                        {u.isBanned ? 'UNBAN' : 'SUSPEND'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
