
import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (proxyUrl: string) => void;
  initialProxyUrl: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialProxyUrl }) => {
  const [proxyUrl, setProxyUrl] = useState(initialProxyUrl);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(proxyUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-brand-text">Proxy Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <CloseIcon className="w-6 h-6 text-brand-text-dim" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="proxyUrl" className="block text-sm font-medium text-brand-text-dim mb-1">
              CORS Proxy URL
            </label>
            <input
              type="text"
              id="proxyUrl"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="e.g., https://cors-proxy.example.com/"
              className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
            />
            <p className="mt-2 text-xs text-brand-text-dim">
              Use a CORS proxy to play geo-locked channels. The proxy URL will be prepended to stream links. Leave blank to disable.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-white/10 text-brand-text hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-blue-500 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
