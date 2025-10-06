
import React from 'react';
import { TvIcon, SettingsIcon } from './icons';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-brand-surface p-4 flex justify-between items-center shadow-md z-10">
      <div className="flex items-center gap-3">
        <TvIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-2xl font-bold text-brand-text tracking-wider">StreamFlow</h1>
      </div>
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary transition-colors"
        aria-label="Open settings"
      >
        <SettingsIcon className="w-6 h-6 text-brand-text-dim" />
      </button>
    </header>
  );
};

export default Header;
