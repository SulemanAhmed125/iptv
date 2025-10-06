
import { Channel } from '../types';

const M3U_URL = "https://iptv-org.github.io/iptv/index.m3u";

const parseM3U = (data: string): Channel[] => {
  const lines = data.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const info = line.substring(line.indexOf(' ') + 1);
      
      const tvgIdMatch = info.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = info.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = info.match(/tvg-logo="([^"]*)"/);
      const groupTitleMatch = info.match(/group-title="([^"]*)"/);
      
      const name = info.substring(info.lastIndexOf(',') + 1).trim();

      currentChannel = {
        id: tvgIdMatch ? tvgIdMatch[1] : name + Math.random(),
        name: tvgNameMatch ? tvgNameMatch[1] : name,
        logo: tvgLogoMatch ? tvgLogoMatch[1] : null,
        group: groupTitleMatch ? groupTitleMatch[1] : 'Uncategorized',
      };

    } else if (line.trim().length > 0 && !line.startsWith('#')) {
      if (currentChannel.name) {
        currentChannel.url = line.trim();
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }
  }
  return channels;
};

export const fetchAndParseM3u = async (): Promise<Channel[]> => {
  try {
    const response = await fetch(M3U_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U file: ${response.statusText}`);
    }
    const m3uData = await response.text();
    return parseM3U(m3uData);
  } catch (error) {
    console.error("Error fetching or parsing M3U file:", error);
    throw error;
  }
};
