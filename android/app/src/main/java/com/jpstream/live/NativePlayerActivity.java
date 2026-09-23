package com.jpstream.live;

import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.datasource.DefaultHttpDataSource;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;
import androidx.media3.ui.PlayerView;

public class NativePlayerActivity extends AppCompatActivity {
    private ExoPlayer player;
    private PlayerView playerView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        playerView = new PlayerView(this);
        setContentView(playerView);

        String streamUrl = getIntent().getStringExtra("STREAM_URL");
        String userAgent = getIntent().getStringExtra("USER_AGENT");

        if (userAgent == null || userAgent.isEmpty()) {
            userAgent = "JP STREAM/1.0 (Linux; Android)";
        }

        DefaultHttpDataSource.Factory dataSourceFactory = new DefaultHttpDataSource.Factory()
                .setUserAgent(userAgent)
                .setAllowCrossProtocolRedirects(true);

        player = new ExoPlayer.Builder(this)
                .setMediaSourceFactory(new DefaultMediaSourceFactory(dataSourceFactory))
                .build();

        playerView.setPlayer(player);

        MediaItem.Builder mediaItemBuilder = new MediaItem.Builder().setUri(Uri.parse(streamUrl));

        if (streamUrl.contains(".m3u8")) {
            mediaItemBuilder.setMimeType(MimeTypes.APPLICATION_M3U8);
        } else if (streamUrl.contains(".mpd")) {
            mediaItemBuilder.setMimeType(MimeTypes.APPLICATION_MPD);
        } else if (streamUrl.contains(".ts")) {
            mediaItemBuilder.setMimeType(MimeTypes.VIDEO_MP2T);
        }

        player.setMediaItem(mediaItemBuilder.build());
        player.prepare();
        player.setPlayWhenReady(true);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (player != null) {
            player.release();
        }
    }
}

