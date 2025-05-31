export interface Settings {
  apiKey: string;
  autoTrack: boolean;
  summaryLength: 'short' | 'medium' | 'long';
  theme: 'light' | 'dark';
}

export interface Memory {
  id: string;
  url: string;
  title: string;
  summary: string;
  content: string;
  timestamp: number;
  tags: string[];
} 