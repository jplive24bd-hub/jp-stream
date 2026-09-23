import React, { useState } from 'react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [m3uText, setM3uText] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuthenticated(true);
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  const handleSaveM3u = () => {
    if (!m3uText) return alert('M3U কনটেন্ট দিন');
    const lines = m3uText.split('\n');
    const parsedChannels = [];
    let currentName = 'Live Stream';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const parts = line.split(',');
        if (parts.length > 1) currentName = parts[1].trim();
      } else if (line.startsWith('http')) {
        parsedChannels.push({ name: currentName, url: line });
      }
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsedChannels, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "channels.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    alert('channels.json ফাইল ডাউনলোড হয়েছে! এটি GitHub-এ আপলোড করলেই অ্যাপ আপডেট হয়ে যাবে।');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ padding: '30px', backgroundColor: '#222', borderRadius: '10px', width: '280px', textAlign: 'center' }}>
          <h3 style={{ color: '#e50914', marginTop: 0 }}>JP STREAM Admin</h3>
          <input
            type="password"
            placeholder="পাসওয়ার্ড দিন (123456)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', margin: '15px 0', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#e50914' }}>JP STREAM Admin Panel</h2>
      <div style={{ background: '#222', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>M3U Playlist Converter</h3>
        <p style={{ color: '#aaa', fontSize: '13px' }}>আপনার M3U টেক্সট পেস্ট করে `channels.json` তৈরি করুন:</p>
        <textarea
          rows="10"
          value={m3uText}
          onChange={(e) => setM3uText(e.target.value)}
          placeholder="#EXTINF:-1, Channel Name&#10;http://example.com/stream.m3u8"
          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '10px', borderRadius: '5px' }}
        />
        <button onClick={handleSaveM3u} style={{ padding: '10px 20px', marginTop: '15px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Export channels.json
        </button>
      </div>
    </div>
  );
          }
