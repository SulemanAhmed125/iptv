import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useIptv } from './hooks/useIptv';
import { Channel } from './types';
import ChannelList from './components/ChannelList';
import Player from './components/Player';
import Header from './components/Header';
import Loader from './components/Loader';
import SettingsModal from './components/SettingsModal';
import { SearchIcon } from './components/icons';

// Helper function to categorize channels into simpler groups
const getSimplifiedGroup = (originalGroup: string): string => {
  const keywords: { [key: string]: string[] } = {
    'Movies': ['movie'],
    'Music': ['music', 'song', 'radio'],
    'Education': ['education', 'learn', 'documentary'],
    'News': ['news'],
    'Sports': ['sport'],
    'Kids': ['kid', 'child'],
    'Entertainment': ['entertainment', 'lifestyle', 'comedy'],
    'Religious': ['religious'],
    'Shopping': ['shop', 'sale'],
  };

  const groupLower = originalGroup.toLowerCase();

  for (const category in keywords) {
    if (keywords[category].some(keyword => groupLower.includes(keyword))) {
      return category;
    }
  }
  
  // Group everything else, like country-specific channels, into a general category.
  return 'General';
};


const App: React.FC = () => {
  const { channels, isLoading, error } = useIptv();
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [proxyUrl, setProxyUrl] = useState<string>(() => {
    return localStorage.getItem('iptvProxyUrl') || '';
  });

  useEffect(() => {
    localStorage.setItem('iptvProxyUrl', proxyUrl);
  }, [proxyUrl]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const groupedAndFilteredChannels = useMemo(() => {
    const filtered = channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSimplifiedGroup(channel.group).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups: Record<string, Channel[]> = {};
    for (const channel of filtered) {
        const simpleGroup = getSimplifiedGroup(channel.group);
        if (!groups[simpleGroup]) {
            groups[simpleGroup] = [];
        }
        groups[simpleGroup].push(channel);
    }
    
    return Object.entries(groups)
        .sort(([groupA], [groupB]) => {
            // Keep 'General' group at the bottom
            if (groupA === 'General') return 1;
            if (groupB === 'General') return -1;
            return groupA.localeCompare(groupB);
        })
        .map(([groupName, channels]) => ({ groupName, channels }));

  }, [channels, searchTerm]);
  
  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups(prev => {
        const newSet = new Set(prev);
        if (newSet.has(groupName)) {
            newSet.delete(groupName);
        } else {
            newSet.add(groupName);
        }
        return newSet;
    });
  }, []);

  const handleSaveSettings = (newProxyUrl: string) => {
    setProxyUrl(newProxyUrl);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-brand-bg">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-brand-surface flex flex-col shadow-lg overflow-y-auto">
          <div className="p-3 sticky top-0 bg-brand-surface z-10">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-dim" />
              <input
                type="text"
                placeholder="Search channels & groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-bg border border-white/20 rounded-md pl-10 pr-4 py-2 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
          </div>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : (
            <ChannelList 
                groupedChannels={groupedAndFilteredChannels} 
                onChannelSelect={setCurrentChannel}
                currentChannelId={currentChannel?.id || null}
                expandedGroups={expandedGroups}
                onToggleGroup={toggleGroup}
            />
          )}
        </aside>
        <main className="flex-1 bg-black">
          <Player channel={currentChannel} proxyUrl={proxyUrl} />
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialProxyUrl={proxyUrl}
      />
    </div>
  );
};

export default App;
