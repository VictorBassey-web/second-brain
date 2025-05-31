import { GoogleGenerativeAI } from '@google/generative-ai';

interface PageContent {
  title: string;
  content: string;
  url: string;
  timestamp: number;
}

export interface Memory { // Export Memory here as it's used in other files
  id: string;
  url: string;
  title: string;
  summary: string; // AI-generated summary
  content: string; // Original extracted content
  timestamp: number;
  tags: string[];
}

class BackgroundService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Initialize Google AI with a default empty key
    this.genAI = new GoogleGenerativeAI('');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.initializeMessageListener();
    this.loadApiKey();
  }

  private initializeMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'PAGE_CONTENT') {
        this.processContent(message.payload);
      }
    });
  }

  private async processContent(content: PageContent): Promise<void> {
    try {
      // Reload API key before processing
      await this.loadApiKey();

      // Check if we have a valid API key before processing
      if (!this.genAI || !this.model) {
        console.warn('Cannot process content: API key not set. Please set your Google API key in the extension options.');
        return;
      }

      // Generate summary using Google AI
      const prompt = `Please summarize the following content in a concise way and extract key topics as tags:
        Title: ${content.title}
        Content: ${content.content}`;

      console.log('Sending prompt to AI:', prompt);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiSummary = response.text(); // Renamed variable to avoid confusion
      console.log('Received summary from AI:', aiSummary);

      // Extract tags from the AI summary
      const tags = this.extractTags(aiSummary);

      // Create memory object with correct property mapping
      const memoryObj: Memory = {
        id: crypto.randomUUID(),
        title: content.title,
        url: content.url,
        timestamp: content.timestamp,
        content: content.content, // Original extracted content
        summary: aiSummary, // AI-generated summary
        tags: tags
      };
      console.log('Saving memory object to storage:', memoryObj);

      // Store in chrome.storage.local
      await this.storeSummary(memoryObj);
    } catch (error) {
      console.error('Error processing content:', error);
    }
  }

  private extractTags(summary: string): string[] {
    // Simple tag extraction - you might want to improve this
    const words = summary.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

    // Basic tag extraction: words longer than 3 characters, not common words, take top 5
    return [...new Set(words)]
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 5);
  }

  private async storeSummary(memory: Memory): Promise<void> {
    try {
      const result = await chrome.storage.local.get('memories'); // Use 'memories' key
      const memories: Memory[] = result.memories || [];

      // Add new memory at the beginning
      memories.unshift(memory);

      // Keep only the last 100 memories
      const trimmedMemories = memories.slice(0, 100);

      await chrome.storage.local.set({ memories: trimmedMemories }); // Use 'memories' key
      console.log(`Memory for "${memory.title}" saved successfully.`);
    } catch (error) {
      console.error('Error storing memory:', error);
    }
  }

  private async loadApiKey(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get('settings');
      const settings = result.settings || {};
      const apiKey = settings.apiKey;

      if (!apiKey) {
        console.warn('No API key found in settings. Please set your Google API key in the extension options.');
        // Do not initialize genAI or model if API key is missing
        this.genAI = undefined as any; // Explicitly set to undefined
        this.model = undefined;
        return;
      }

      console.log('API Key loaded successfully');
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (error) {
      console.error('Error loading API key:', error);
      this.genAI = undefined as any; // Explicitly set to undefined on error
      this.model = undefined;
    }
  }
}

// Initialize the background service
new BackgroundService(); 