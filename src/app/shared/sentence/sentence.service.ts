import {
  Injectable,
  signal,
  WritableSignal,
  Inject,
  InjectionToken,
} from '@angular/core';
import {
  CreateMLCEngine,
  MLCEngine,
  ChatCompletionMessageParam,
} from '@mlc-ai/web-llm';

// String constants

const EMPTY_STRING = '';
const AUTO_INIT_REJECT_MESSAGE = 'autoInit is false';
const ENGINE_INIT_FAIL = 'Engine initialization failed:';
const MODEL_ID = 'Llama-3.1-8B-Instruct-q4f32_1-MLC';
const LLM_INIT_FAIL_MESSAGE = 'LLM failed to initialize.';
const ERROR_GENERATING_SENTENCE = 'Error generating sentence.';

// Configuration interface for SentenceService
export interface SentenceServiceConfig {
  autoInit?: boolean;
}

export const SENTENCE_SERVICE_CONFIG =
  new InjectionToken<SentenceServiceConfig>('SentenceServiceConfig');

@Injectable({ providedIn: 'root' })
export class SentenceService {
  private modelId = MODEL_ID;
  private engine: MLCEngine | null = null;
  private initPromise: Promise<void>;
  public isInitialized: WritableSignal<boolean> = signal(false);
  public isBusy: WritableSignal<boolean> = signal(false);

  private config: SentenceServiceConfig;

  constructor(@Inject(SENTENCE_SERVICE_CONFIG) config?: SentenceServiceConfig) {
    this.config = config ?? {};
    if (this.config.autoInit) {
      this.initPromise = this.initEngine().catch((error) => {
        console.error(ENGINE_INIT_FAIL, error);
        // Re-throw to maintain promise rejection
        throw error;
      });
    } else {
      this.initPromise = Promise.reject(AUTO_INIT_REJECT_MESSAGE);
    }
  }
  /**
      const prompt = `Use the word '${targetWord}' in a sentence.`;
   */
  public async initializeEngine(): Promise<void> {
    if (!this.isInitialized()) {
      // Check if the promise was rejected with autoInitRejectMessage
      try {
        await this.initPromise;
      } catch (error) {
        if (error === AUTO_INIT_REJECT_MESSAGE) {
          // Reset the promise and initialize
          this.initPromise = this.initEngine().catch((error) => {
            console.error(ENGINE_INIT_FAIL, error);
            throw error;
          });
          return this.initPromise;
        } else {
          // Re-throw other errors
          throw error;
        }
      }

      // If we get here, the promise resolved successfully
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
    const initialized = await this.ensureEngineInitialized();
    if (!initialized) {
      this.isBusy.set(false);
      return LLM_INIT_FAIL_MESSAGE;
    }

    const prompt = `Use the word '${targetWord}' in a sentence.`;
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `
          You are a spelling bee tutor for 5th graders.
          - Always generate exactly one G-rated sentence using the given word.
          - Sentence should be 8–14 words.
          - Keep the vocabulary simple and kid-appropriate.
        `,
      },
      { role: 'user', content: prompt },
    ];
    try {
      const reply = await this.engine!.chat.completions.create({ messages });
      const sentence = reply.choices[0]?.message?.content || EMPTY_STRING;
      return sentence;
    } catch (error) {
      // ...existing code...
      return ERROR_GENERATING_SENTENCE;
    } finally {
      this.isBusy.set(false);
    }
  }

  /**
   * Ensures the engine is initialized, handling autoInitRejectMessage.
   * Returns true if initialized, false otherwise.
   */
  private async ensureEngineInitialized(): Promise<boolean> {
    try {
      await this.initPromise;
      return !!this.engine;
    } catch (error) {
      if (error === AUTO_INIT_REJECT_MESSAGE) {
        this.initPromise = this.initEngine().catch((err) => {
          console.error('Engine initialization failed:', err);
          throw err;
        });
        try {
          await this.initPromise;
          return !!this.engine;
        } catch {
          return false;
        }
      }
      return false;
    }
  }
}
