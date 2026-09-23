import React, { useState } from 'react';

export default function Sidebar({ isOpen, onClose, onPlaylistAdded }) {
  const [playlistUrl, setPlaylistUrl] = useState('');

  const handleAddPlaylist = () => {
    if (!playlistUrl) return alert('অনুগ্রহ করে একটি সঠিক M3U URL দিন');
    
    const savedPlaylists = JSON.parse(localStorage.getItem('user_playlists') || '[]');
    savedPlaylists.push({ id: Date.now(), url: playlistUrl });
    localStorage.setItem('user_playlists', JSON.stringify(savedPlaylists));

    alert('প্লেলিস্ট সফলভাবে যোগ করা হয়েছে!');
    setPlaylistUrl('');
    if(onPlaylistAdded) onPlaylistAdded();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: isOpen ? 0 : '-300px',
      width: '280px', height: '100%', backgroundColor: '#181818',
      color: '#fff', transition: '0.3s', zIndex: 1000, padding: '20px'
    }}>
      <button onClick={onClose} style={{ float: 'right', background: 'none', color: '#fff', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      <h3 style={{ color: '#e50914', marginTop: '20px' }}>JP STREAM Menu</h3>

      <div style={{ marginTop: '30px' }}>
        <h4>➕ Add Playlist</h4>
        <input 
          type="text" 
          placeholder="Paste M3U Playlist URL..." 
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', margin: '10px 0', color: '#000' }}
        />
        <button 
          onClick={handleAddPlaylist}
          style={{ width: '100%', padding: '10px', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Save Playlist
        </button>
      </div>
    </div>
  );
}

