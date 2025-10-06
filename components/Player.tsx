import React, { useEffect, useRef, useState } from 'react';
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

const PlayerLoader: React.FC = () => (
  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 pointer-events-none">
    <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg font-semibold tracking-wider">Loading Stream...</p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-red-400 p-4 z-20">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 className="text-xl font-bold text-white mb-2">Playback Error</h3>
    <p className="text-center text-red-300">{message}</p>
  </div>
);


const Player: React.FC<PlayerProps> = ({ channel, proxyUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Reset state when channel changes
    setIsLoading(!!channel);
    setError(null);

    if (!channel) {
        // Stop any playback if channel is deselected
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        videoElement.src = '';
        return;
    }
    
    const finalUrl = proxyUrl ? `${proxyUrl}${channel.url}` : channel.url;

    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }

    const handleCanPlay = () => {
        setIsLoading(false);
        videoElement.play().catch(e => {
            console.error("Autoplay was blocked:", e);
            // Don't show an error, as user can just click to play.
            setIsLoading(false);
        });
    };
    
    const handleError = () => {
        setIsLoading(false);
        setError(`Failed to load the video stream. The source may be offline or incompatible.`);
    };

    if (finalUrl.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hlsConfig = {
            lowLatencyMode: false,
            abrMaxWithRealBitrate: true,
            abrEwmaDefaultEstimate: 100000, // Be very pessimistic (100 kbps)
            maxBufferLength: 90, // Target 90 seconds in buffer
            maxMaxBufferLength: 180, // Allow up to 180 seconds
            maxBufferSize: 120 * 1000 * 1000, // 120MB memory limit
            backBufferLength: 30, // Keep 30s of buffer behind playhead
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 1000,
            levelLoadingTimeOut: 20000,
            levelLoadingMaxRetry: 4,
            levelLoadingRetryDelay: 1000,
            startLevel: 0,
        };
        
        const hls = new Hls(hlsConfig);
        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
                // This provides an expandable object in modern browser consoles for debugging.
                console.error('HLS.js fatal error:', data);

                // Create a more informative message for the user.
                let errorMessage = `Stream error: ${data.details}.`;
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    errorMessage += ' This is often a network or CORS issue. Please check your connection or try configuring a CORS proxy in the settings.';
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                     errorMessage += ' The video data seems to be corrupted.';
                }
                
                setError(errorMessage);
                setIsLoading(false);
                
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    console.warn('Attempting to recover from HLS media error...');
                    hls.recoverMediaError();
                } else {
                    console.error('Unrecoverable HLS error occurred. Destroying HLS instance.');
                    hls.destroy();
                }
            }
        });
        
        videoElement.addEventListener('canplay', handleCanPlay);
        
        hls.loadSource(finalUrl);
        hls.attachMedia(videoElement);

      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = finalUrl;
        videoElement.addEventListener('canplay', handleCanPlay);
        videoElement.addEventListener('error', handleError);
      } else {
        setError("HLS playback is not supported on this browser.");
        setIsLoading(false);
      }
    } else {
      videoElement.src = finalUrl;
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('error', handleError);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoElement) {
          videoElement.removeEventListener('canplay', handleCanPlay);
          videoElement.removeEventListener('error', handleError);
          videoElement.src = '';
          videoElement.load();
      }
    };
  }, [channel, proxyUrl]);

  return (
    <div className="w-full h-full bg-black relative">
      {!channel && <WelcomeScreen />}
      
      <video ref={videoRef} controls autoPlay className="w-full h-full" style={{ visibility: channel ? 'visible' : 'hidden' }} />

      {channel && (
        <>
            {isLoading && <PlayerLoader />}
            {error && <ErrorDisplay message={error} />}

            <div className="absolute top-0 left-0 p-4 bg-gradient-to-b from-black/70 to-transparent w-full pointer-events-none z-10">
                <h2 className="text-2xl font-bold text-white shadow-lg">{channel.name}</h2>
                <p className="text-sm text-gray-300 shadow-md">{channel.group}</p>
            </div>
        </>
      )}
    </div>
  );
};

export default Player;