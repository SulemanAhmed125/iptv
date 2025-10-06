
import React from 'react';
import { Channel } from '../types';
import { TvIcon, ChevronDownIcon } from './icons';

interface GroupedChannels {
  groupName: string;
  channels: Channel[];
}

interface ChannelListProps {
  groupedChannels: GroupedChannels[];
  onChannelSelect: (channel: Channel) => void;
  currentChannelId: string | null;
  expandedGroups: Set<string>;
  onToggleGroup: (groupName: string) => void;
}

const ChannelListItem: React.FC<{
  channel: Channel;
  isSelected: boolean;
  onSelect: () => void;
}> = React.memo(({ channel, isSelected, onSelect }) => (
  <li
    onClick={onSelect}
    role="button"
    aria-pressed={isSelected}
    tabIndex={0}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    className={`flex items-center gap-4 p-3 cursor-pointer rounded-lg transition-colors outline-none ${
      isSelected
        ? 'bg-brand-primary text-white'
        : 'hover:bg-white/10 focus:bg-white/10'
    }`}
  >
    {channel.logo ? (
      <img src={channel.logo} alt={channel.name} className="w-12 h-12 object-contain rounded-md bg-black/20 flex-shrink-0" />
    ) : (
      <div className="w-12 h-12 flex-shrink-0 bg-black/20 rounded-md flex items-center justify-center">
          <TvIcon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-brand-text-dim'}`} />
      </div>
    )}
    <span className="truncate font-semibold text-base">{channel.name}</span>
  </li>
));


const ChannelList: React.FC<ChannelListProps> = ({ 
  groupedChannels, 
  onChannelSelect, 
  currentChannelId,
  expandedGroups,
  onToggleGroup
}) => {
  if (groupedChannels.length === 0) {
    return <div className="p-4 text-center text-brand-text-dim">No channels or groups found.</div>;
  }

  return (
    <div className="p-2 space-y-2">
      {groupedChannels.map(({ groupName, channels }) => {
        const isExpanded = expandedGroups.has(groupName);
        return (
          <div key={groupName}>
            <button
              onClick={() => onToggleGroup(groupName)}
              aria-expanded={isExpanded}
              className="w-full flex justify-between items-center p-4 bg-brand-bg rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="font-bold text-lg text-brand-text truncate">{groupName}</span>
                <span className="text-sm font-mono text-brand-text-dim bg-white/10 px-2.5 py-1 rounded-full flex-shrink-0">{channels.length}</span>
              </div>
              <ChevronDownIcon className={`w-6 h-6 text-brand-text-dim transition-transform transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
              <ul className="space-y-1 pt-2 pl-4 mt-1 border-l-2 border-white/10 ml-4">
                {channels.map((channel) => (
                  <ChannelListItem 
                      key={channel.id}
                      channel={channel}
                      isSelected={currentChannelId === channel.id}
                      onSelect={() => onChannelSelect(channel)}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChannelList;
