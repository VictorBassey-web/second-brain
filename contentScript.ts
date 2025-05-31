import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';

interface PageContent {
  title: string;
  content: string;
  url: string;
  timestamp: number;
}

class ContentTracker {
  private lastScrollPosition: number = 0;
  private scrollThreshold: number = 100;
  private isProcessing: boolean = false;

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // Track scroll events
    window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 200));
    
    // Track clicks
    document.addEventListener('click', this.handleClick.bind(this));
    
    // Track when user leaves the page
    window.addEventListener('beforeunload', this.handlePageLeave.bind(this));
  }

  private async handleScroll(): Promise<void> {
    const currentScroll = window.scrollY;
    const scrollDiff = Math.abs(currentScroll - this.lastScrollPosition);
    
    if (scrollDiff > this.scrollThreshold) {
      this.lastScrollPosition = currentScroll;
      await this.processPageContent();
    }
  }

  private handleClick(event: MouseEvent): void {
    // Track meaningful clicks (e.g., on links, buttons)
    const target = event.target as HTMLElement;
    if (target.tagName === 'A' || target.tagName === 'BUTTON') {
      this.processPageContent();
    }
  }

  private async handlePageLeave(): Promise<void> {
    await this.processPageContent();
  }

  private async processPageContent(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pageContent = this.extractReadableContent();
      if (pageContent) {
        await this.sendToBackground(pageContent);
      }
    } catch (error) {
      console.error('Error processing page content:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private extractReadableContent(): PageContent | null {
    try {
      const documentClone = document.cloneNode(true) as Document;
      const reader = new Readability(documentClone);
      const article = reader.parse();

      if (!article) return null;

      return {
        title: article.title,
        content: DOMPurify.sanitize(article.textContent || ''),
        url: window.location.href,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error extracting content:', error);
      return null;
    }
  }

  private async sendToBackground(content: PageContent): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'PAGE_CONTENT',
        payload: content
      });
    } else {
      console.error('chrome.runtime.sendMessage is not available');
    }
  }

  private debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
}

// Initialize the content tracker
new ContentTracker(); 