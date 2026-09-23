import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [channels, setChannels] = useState([]);
  const [m3uText, setM3uText] = useState('');

  const fetchChannels = async () => {
    const res = await fetch('/api/channels/active');
    const data = await res.json();
    setChannels(data);
  };

  useEffect(() => { fetchChannels(); }, []);

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

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#111', minHeight: '100vh' }}>
      <h2 style={{ color: '#e50914' }}>JP STREAM Admin Panel</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>M3U Auto Category Importer</h3>
        <textarea 
          rows="5" 
          style={{ width: '100%', color: '#000', padding: '10px' }} 
          placeholder="Paste M3U content here..." 
          onChange={(e) => setM3uText(e.target.value)}
        />
        <button onClick={handleImport} style={{ padding: '10px 20px', marginTop: '10px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '5px' }}>
          Import Playlist
        </button>
      </div>

      <h3>Manage Live Channels</h3>
      {channels.map(ch => (
        <div key={ch.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #333' }}>
          <span>{ch.name}</span>
          <div>
            <button onClick={() => toggleVisibility(ch.id, ch.isVisible)} style={{ padding: '5px 10px', marginRight: '5px' }}>
              {ch.isVisible ? 'Hide' : 'Unhide'}
            </button>
            <button onClick={() => deleteChannel(ch.id)} style={{ color: 'red', padding: '5px 10px' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

