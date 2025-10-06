
import React, { useEffect, useRef } from 'react';
import { Channel } from '../types';
import { TvIcon } from './icons';

// Tell TypeScript that Hls is available on the window object
declare var Hls: any;

interface PlayerProps {
  channel: Channel | null;
  proxyUrl: string;
}

const WelcomeScreen: React.FC = () => (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center text-brand-text-dim">
        <TvIcon className="w-24 h-24 mb-4" />
        <h2 className="text-3xl font-bold text-brand-text">Welcome to StreamFlow</h2>
        <p className="mt-2 text-lg">Select a channel from the list to start watching.</p>
    </div>
);

const Player: React.FC<PlayerProps> = ({ channel, proxyUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !channel) return;
    
    const finalUrl = proxyUrl ? `${proxyUrl}${channel.url}` : channel.url;

    // Destroy previous HLS instance if it exists
    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }

    if (finalUrl.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(finalUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch(e => console.error("Autoplay was blocked:", e));
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support on platforms like Safari
        videoElement.src = finalUrl;
        videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play().catch(e => console.error("Autoplay was blocked:", e));
        });
      }
    } else {
      // For non-HLS streams
      videoElement.src = finalUrl;
      videoElement.play().catch(e => console.error("Autoplay was blocked:", e));
    }

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, proxyUrl]);

  return (
    <div className="w-full h-full bg-black relative">
      {channel ? (
        <>
            <video ref={videoRef} controls autoPlay className="w-full h-full" />
            <div className="absolute top-0 left-0 p-4 bg-gradient-to-b from-black/70 to-transparent w-full pointer-events-none">
                <h2 className="text-2xl font-bold text-white shadow-lg">{channel.name}</h2>
                <p className="text-sm text-gray-300 shadow-md">{channel.group}</p>
            </div>
        </>
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};

export default Player;
