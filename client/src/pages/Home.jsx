import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import dashjs from 'dashjs';

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [playlistUrlInput, setPlaylistUrlInput] = useState('');
  const [directStreamUrl, setDirectStreamUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const dashPlayerRef = useRef(null);

  // ডিফল্ট প্লেলিস্ট লোড
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

  // সব ধরনের URL (HLS, DASH, TS, HTTP/HTTPS) প্লে করার অটোমেটিক হ্যান্ডলার
  useEffect(() => {
    if (!selectedChannel || !selectedChannel.url || !videoRef.current) return;

    const streamUrl = selectedChannel.url.trim();

    // পূর্বের প্লেয়ার ইনস্ট্যান্স ক্লিনআপ
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (dashPlayerRef.current) {
      dashPlayerRef.current.reset();
      dashPlayerRef.current = null;
    }

    // ১. MPEG-DASH (.mpd) স্ট্রিম সাপোর্ট
    if (streamUrl.includes('.mpd')) {
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, streamUrl, true);
      dashPlayerRef.current = player;
    }
    // ২. HLS (.m3u8) ও MPEG-TS (.ts) স্ট্রিম সাপোর্ট
    else if (Hls.isSupported() && (streamUrl.includes('.m3u8') || streamUrl.includes('.ts') || streamUrl.startsWith('http'))) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play().catch(() => {});
      });
      hlsRef.current = hls;
    }
    // ৩. নেটিভ ব্রাউজার স্ট্রিম
    else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.src = streamUrl;
      videoRef.current.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (dashPlayerRef.current) dashPlayerRef.current.reset();
    };
  }, [selectedChannel]);

  // যেকোনো বাহ্যিক M3U/M3U8 প্লেলিস্ট URL থেকে চ্যানেল লোড করার ফানশন
  const handleLoadPlaylistUrl = async () => {
    if (!playlistUrlInput) return alert('একটি M3U প্লেলিস্ট URL দিন!');
    setLoading(true);
    try {
      const response = await fetch(playlistUrlInput);
      const text = await response.text();
      
      const lines = text.split('\n');
      const parsedChannels = [];
      let currentName = 'Live Channel';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
          const parts = line.split(',');
          if (parts.length > 1) currentName = parts[1].trim();
        } else if (line.startsWith('http://') || line.startsWith('https://')) {
          parsedChannels.push({ name: currentName, url: line });
        }
      }

      if (parsedChannels.length > 0) {
        setChannels(parsedChannels);
        setSelectedChannel(parsedChannels[0]);
        alert(`${parsedChannels.length} টি চ্যানেল লোড হয়েছে!`);
      } else {
        alert('প্লেলিস্টে কোনো মেলা চ্যানেল পাওয়া যায়নি!');
      }
    } catch (err) {
      alert('প্লেলিস্ট লোড করতে সমস্যা হয়েছে! URL-টি ঠিক আছে কিনা পরীক্ষা করুন।');
    }
    setLoading(false);
  };

  // যেকোনো একক ডাইরেক্ট ভিডিও/স্ট্রিম URL প্লে করার ফানশন
  const handlePlayDirectUrl = () => {
    if (!directStreamUrl) return;
    const newChan = { name: 'Direct Stream', url: directStreamUrl };
    setSelectedChannel(newChan);
  };

  return (
    <div style={{ backgroundColor: '#0f0f0f', color: '#fff', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #e50914' }}>
        <h1 style={{ color: '#e50914', margin: 0, fontSize: '24px' }}>JP STREAM PLAYER</h1>
        <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '12px' }}>Supports HTTP, HTTPS, M3U8, MPD, TS Streams</p>
      </header>

      {/* প্লেয়ার বক্স */}
      {selectedChannel ? (
        <div style={{ marginBottom: '20px', background: '#1f1f1f', borderRadius: '10px', overflow: 'hidden', padding: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '16px' }}>
            🔴 Now Playing: {selectedChannel.name}
          </h3>
          <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            style={{ width: '100%', maxHeight: '280px', backgroundColor: '#000', borderRadius: '8px' }}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>কোনো স্ট্রিম সিলেক্ট করা নেই</div>
      )}

      {/* OTT Navigator / Televizo স্টাইল M3U URL ও ডাইরেক্ট লিঙ্ক ইনপুট বক্স */}
      <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#e50914' }}>🔗 Load Remote M3U Playlist</h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="http://example.com/playlist.m3u8"
            value={playlistUrlInput}
            onChange={(e) => setPlaylistUrlInput(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#252525', color: '#fff' }}
          />
          <button
            onClick={handleLoadPlaylistUrl}
            style={{ padding: '8px 15px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Loading...' : 'Load M3U'}
          </button>
        </div>

        <h4 style={{ margin: '0 0 8px 0', color: '#e50914' }}>▶️ Play Direct Stream URL</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="http://.../.m3u8 or .mpd or .ts"
            value={directStreamUrl}
            onChange={(e) => setDirectStreamUrl(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#252525', color: '#fff' }}
          />
          <button
            onClick={handlePlayDirectUrl}
            style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Play URL
          </button>
        </div>
      </div>

      {/* চ্যানেল লিস্ট */}
      <h3 style={{ borderLeft: '4px solid #e50914', paddingLeft: '8px', marginBottom: '12px', fontSize: '18px' }}>
        Channel List ({channels.length})
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
        {channels.map((ch, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedChannel(ch)}
            style={{
              background: selectedChannel?.url === ch.url ? '#e50914' : '#222',
              padding: '10px',
              borderRadius: '6px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
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
              
