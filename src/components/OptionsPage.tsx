import React, { useState, useEffect } from 'react';
import { Settings } from '../types';

const OptionsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    autoTrack: true,
    summaryLength: 'medium',
    theme: 'light'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from storage
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  const handleSave = () => {
    console.log('Saving settings:', settings);
    chrome.storage.sync.set({ settings }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving settings:', chrome.runtime.lastError);
      } else {
        console.log('Settings saved successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NeuroPilot Settings</h1>
      
      <div className="space-y-6">
        {/* API Key */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            Google API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter your Google API key"
          />
          <p className="mt-1 text-sm text-gray-500">
            Required for AI features. Get your key from the Google Cloud Console.
          </p>
        </div>

        {/* Auto Track */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.autoTrack}
              onChange={(e) => setSettings({ ...settings, autoTrack: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Automatically track page visits</span>
          </label>
        </div>

        {/* Summary Length */}
        <div>
          <label htmlFor="summaryLength" className="block text-sm font-medium text-gray-700">
            Summary Length
          </label>
          <select
            id="summaryLength"
            value={settings.summaryLength}
            onChange={(e) => setSettings({ ...settings, summaryLength: e.target.value as 'short' | 'medium' | 'long' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        {/* Theme */}
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
            Theme
          </label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage; 