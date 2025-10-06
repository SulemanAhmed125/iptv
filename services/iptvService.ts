import { Channel } from '../types';

const M3U_SOURCES = [
  // India
  { url: "https://iptv-org.github.io/iptv/countries/in.m3u", country: "India" },
  { url: "https://iptv-org.github.io/iptv/categories/in_news.m3u", country: "India" },
  { url: "https://iptv-org.github.io/iptv/categories/in_movies.m3u", country: "India" },
  { url: "https://iptv-org.github.io/iptv/categories/in_entertainment.m3u", country: "India" },
  { url: "https://iptv-org.github.io/iptv/categories/in_sports.m3u", country: "India" },
  { url: "https://iptv-org.github.io/iptv/categories/in_music.m3u", country: "India" },

  // Pakistan
  { url: "https://iptv-org.github.io/iptv/countries/pk.m3u", country: "Pakistan" },
  { url: "https://iptv-org.github.io/iptv/categories/pk_news.m3u", country: "Pakistan" },
  { url: "https://iptv-org.github.io/iptv/categories/pk_entertainment.m3u", country: "Pakistan" },

  // USA
  { url: "https://iptv-org.github.io/iptv/countries/us.m3u", country: "USA" },
  { url: "https://iptv-org.github.io/iptv/categories/us_news.m3u", country: "USA" },
  { url: "https://iptv-org.github.io/iptv/categories/us_entertainment.m3u", country: "USA" },
  { url: "https://iptv-org.github.io/iptv/categories/us_classic.m3u", country: "USA" },
  { url: "https://iptv-org.github.io/iptv/categories/us_sports.m3u", country: "USA" },
  { url: "https://iptv-org.github.io/iptv/categories/us_music.m3u", country: "USA" },
];

const parseM3U = (data: string, country: string): Channel[] => {
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
        id: tvgIdMatch ? tvgIdMatch[1] : undefined,
        name: tvgNameMatch ? tvgNameMatch[1] : name,
        logo: tvgLogoMatch ? tvgLogoMatch[1] : null,
        group: groupTitleMatch ? groupTitleMatch[1] : country,
        country: country,
      };

    } else if (line.trim().length > 0 && !line.startsWith('#')) {
      if (currentChannel.name) {
        currentChannel.url = line.trim();
        // Use URL as ID if tvg-id is missing or empty for a stable, unique key.
        if (!currentChannel.id) {
            currentChannel.id = currentChannel.url;
        }
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }
  }
  return channels;
};

export const fetchAndParseM3u = async (): Promise<Channel[]> => {
  try {
    const responses = await Promise.all(
      M3U_SOURCES.map(source => 
        fetch(source.url).then(res => {
          if (!res.ok) {
            console.warn(`Failed to fetch M3U file from ${source.url}: ${res.statusText}`);
            return null;
          }
          return res.text().then(data => ({ data, country: source.country }));
        }).catch(err => {
          console.warn(`Network error fetching M3U file from ${source.url}:`, err);
          return null;
        })
      )
    );

    const allChannels: Channel[] = [];
    responses.forEach(response => {
      if (response) {
        const channels = parseM3U(response.data, response.country);
        allChannels.push(...channels);
      }
    });

    // Remove duplicates based on URL, which is the most reliable unique identifier for a stream.
    const uniqueChannels = Array.from(new Map(allChannels.map(c => [c.url, c])).values());
    
    return uniqueChannels;

  } catch (error) {
    console.error("Error fetching or parsing M3U files:", error);
    throw error;
  }
};