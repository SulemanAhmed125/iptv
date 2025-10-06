
import { useState, useEffect } from 'react';
import { Channel } from '../types';
import { fetchAndParseM3u } from '../services/iptvService';

export const useIptv = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const parsedChannels = await fetchAndParseM3u();
        setChannels(parsedChannels);
      } catch (err) {
        setError("Failed to load channel list. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();
  }, []);

  return { channels, isLoading, error };
};
