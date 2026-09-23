import React, { useState, useEffect } from 'react';

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/jplive24bc/jp-stream/main/channels.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChannels(data);
          if (data.length > 0) setSelectedChannel(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: '#0f0f0f', color: '#fff', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e50914' }}>
        <h1 style={{ color: '#e50914', margin: 0, fontSize: '24px' }}>JP STREAM</h1>
        <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '12px' }}>Live TV Streaming Platform</p>
      </header>

      {selectedChannel ? (
        <div style={{ marginBottom: '20px', background: '#1f1f1f', borderRadius: '10px', overflow: 'hidden', padding: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Now Playing: {selectedChannel.name}</h3>
          <video
            controls
            autoPlay
            style={{ width: '100%', maxHeight: '250px', backgroundColor: '#000', borderRadius: '8px' }}
            src={selectedChannel.url}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
          <p>কোনো চ্যানেল পাওয়া যায়নি বা লোড হচ্ছে...</p>
        </div>
      )}

      <h3 style={{ borderLeft: '4px solid #e50914', paddingLeft: '8px', marginBottom: '15px' }}>Live Channels</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
        {channels.map((ch, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedChannel(ch)}
            style={{
              background: selectedChannel?.url === ch.url ? '#e50914' : '#222',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {ch.name}
          </div>
        ))}
      </div>
    </div>
  );
}
