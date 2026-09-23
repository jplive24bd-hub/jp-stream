import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('admin@jpstream.com');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [channels, setChannels] = useState([]);
  const [m3uText, setM3uText] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setIsAuthenticated(true);
    } else {
      alert(data.error || 'Login Failed');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return alert('নতুন পাসওয়ার্ড টাইপ করুন');
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      alert('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
      setPassword(newPassword);
      setNewPassword('');
    }
  };

  const fetchChannels = async () => {
    const res = await fetch('/api/channels/active');
    const data = await res.json();
    setChannels(data);
  };

  useEffect(() => {
    if (isAuthenticated) fetchChannels();
  }, [isAuthenticated]);

  const handleImport = async () => {
    await fetch('/api/admin/import-m3u', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ m3uContent: m3uText })
    });
    alert('M3U Auto-Imported Successfully!');
    fetchChannels();
  };

  const toggleVisibility = async (id, currentStatus) => {
    await fetch(`/api/admin/channels/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !currentStatus })
    });
    fetchChannels();
  };

  const deleteChannel = async (id) => {
    if (confirm('Delete this channel?')) {
      await fetch(`/api/admin/channels/${id}`, { method: 'DELETE' });
      fetchChannels();
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: '#fff' }}>
        <form onSubmit={handleLogin} style={{ padding: '30px', backgroundColor: '#222', borderRadius: '10px', width: '300px' }}>
          <h3 style={{ color: '#e50914', textAlign: 'center' }}>JP STREAM Admin Access</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>Admin Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px', color: '#000' }} 
              required 
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input 
              type="password" 
              placeholder="123456"
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px', color: '#000' }} 
              required 
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login to Admin</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#111', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#e50914' }}>JP STREAM Admin Panel</h2>
        <button onClick={() => setIsAuthenticated(false)} style={{ background: '#333', color: '#fff', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Change Password Section */}
      <div style={{ background: '#222', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <h4>🔑 Change Password</h4>
        <input 
          type="password" 
          placeholder="New Password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', color: '#000' }} 
        />
        <button onClick={handleChangePassword} style={{ padding: '8px 15px', background: '#e50914', color: '#fff', border: 'none', cursor: 'pointer' }}>Update Password</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>M3U Auto Category Importer</h3>
        <textarea 
          rows="5" 
          style={{ width: '100%', color: '#000', padding: '10px' }} 
          placeholder="Paste M3U content here..." 
          onChange={(e) => setM3uText(e.target.value)}
        />
        <button onClick={handleImport} style={{ padding: '10px 20px', marginTop: '10px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Import Playlist
        </button>
      </div>

      <h3>Manage Live Channels</h3>
      {channels.map(ch => (
        <div key={ch.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #333' }}>
          <span>{ch.name}</span>
          <div>
            <button onClick={() => toggleVisibility(ch.id, ch.isVisible)} style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>
              {ch.isVisible ? 'Hide' : 'Unhide'}
            </button>
            <button onClick={() => deleteChannel(ch.id)} style={{ color: 'red', padding: '5px 10px', cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
      }
      
