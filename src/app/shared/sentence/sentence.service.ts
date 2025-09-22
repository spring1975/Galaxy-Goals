import { Injectable, signal, WritableSignal, Inject, InjectionToken } from '@angular/core';
import { CreateMLCEngine, MLCEngine, ChatCompletionMessageParam } from '@mlc-ai/web-llm';

// Configuration interface for SentenceService
export interface SentenceServiceConfig {
  autoInit?: boolean;
}

export const SENTENCE_SERVICE_CONFIG = new InjectionToken<SentenceServiceConfig>('SentenceServiceConfig');

@Injectable({ providedIn: 'root' })
export class SentenceService {
  private engine: MLCEngine | null = null;
  private modelId = 'Llama-3.1-8B-Instruct-q4f32_1-MLC';
  private initPromise: Promise<void>;
  public isInitialized: WritableSignal<boolean> = signal(false);
  public isBusy: WritableSignal<boolean> = signal(false);

  private config: SentenceServiceConfig;
  constructor(@Inject(SENTENCE_SERVICE_CONFIG) config?: SentenceServiceConfig) {
    this.config = config ?? {};
    if (this.config.autoInit) {
      this.initPromise = this.initEngine().catch(error => {
        console.error('Engine initialization failed:', error);
        // Re-throw to maintain promise rejection
        throw error;
      });
    } else {
      this.initPromise = Promise.resolve();
    }
  }
  /**
   * Manually initialize the engine if not initialized in constructor.
   */
  public initializeEngine(): Promise<void> {
    if (!this.isInitialized()) {
      this.initPromise = this.initEngine().catch(error => {
        console.error('Engine initialization failed:', error);
        throw error;
      });
      return this.initPromise;
    }
    return this.initPromise;
  }

  private async initEngine(): Promise<void> {
    try {
      this.engine = await CreateMLCEngine(this.modelId);
      this.isInitialized.set(true);
      // Async function automatically returns Promise.resolve() when it completes successfully
    } catch (error) {
      console.error('Failed to initialize WebLLM engine:', error);
      this.isInitialized.set(false);
      throw error;
    }
    console.log('WebLLM engine initialized successfully.');
  }

  async generateSentenceWithBlank(targetWord: string): Promise<string> {
    this.isBusy.set(true);
    try {
      await this.initPromise;
    } catch (error) {
      this.isBusy.set(false);
      console.error('Engine initialization failed in generateSentenceWithBlank:', error);
      return 'LLM failed to initialize.';
    }

    if (!this.engine) {
      this.isBusy.set(false);
      return 'LLM failed to initialize.';
    }

    const prompt = `Use the word '${targetWord}' in a sentence. The sentence should
    have a blank '______' where the word would normally appear.`;
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ];
    try {
      const reply = await this.engine.chat.completions.create({ messages });
      const sentence = reply.choices[0]?.message?.content || '';
      return sentence;
    } catch (error) {
      console.error('Error generating sentence:', error);
      return 'Error generating sentence.';
    } finally {
      this.isBusy.set(false);
    }
  }

  // private replaceWordWithBlank(sentence: string, targetWord: string): string {
  //         // Replace all forms of the target word with blank
  //     const wordRegex = new RegExp(`\b${this.escapeRegex(targetWord)}(s|es|ed|ing)?\b`, 'gi');
  //     return sentence.replace(wordRegex, '______');
  // }

  // private escapeRegex(word: string): string {
  //   return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // }
}
