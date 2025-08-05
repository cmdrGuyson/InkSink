import { makeAutoObservable, runInAction } from "mobx";
import { KeyService } from "@/services/key.service";

export interface ApiKeys {
  openAiApiKey: string;
  geminiApiKey: string;
  claudeApiKey: string;
}

class KeyStore {
  loading: boolean = false;
  error: string | null = null;

  // Unencrypted keys in memory
  openAiApiKey: string = "";
  geminiApiKey: string = "";
  claudeApiKey: string = "";

  constructor() {
    makeAutoObservable(this);

    // Initialize keys from storage when store is created
    this.initializeKeys();
  }

  /**
   * Initialize keys from encrypted storage
   */
  private async initializeKeys() {
    this.loading = true;
    this.error = null;

    try {
      // Load all keys in parallel
      const [openAiKey, geminiKey, claudeKey] = await Promise.all([
        KeyService.loadKey("openai_api_key"),
        KeyService.loadKey("gemini_api_key"),
        KeyService.loadKey("claude_api_key"),
      ]);

      runInAction(() => {
        this.openAiApiKey = openAiKey || "";
        this.geminiApiKey = geminiKey || "";
        this.claudeApiKey = claudeKey || "";
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to load API keys";
        this.loading = false;
      });
    }
  }

  /**
   * Save OpenAI API key
   */
  async saveOpenAiApiKey(key: string) {
    this.error = null;
    try {
      await KeyService.saveKey("openai_api_key", key);
      runInAction(() => {
        this.openAiApiKey = key;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : "Failed to save OpenAI API key";
      });
      throw error;
    }
  }

  /**
   * Save Gemini API key
   */
  async saveGeminiApiKey(key: string) {
    this.error = null;
    try {
      await KeyService.saveKey("gemini_api_key", key);
      runInAction(() => {
        this.geminiApiKey = key;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : "Failed to save Gemini API key";
      });
      throw error;
    }
  }

  /**
   * Save Claude API key
   */
  async saveClaudeApiKey(key: string) {
    this.error = null;
    try {
      await KeyService.saveKey("claude_api_key", key);
      runInAction(() => {
        this.claudeApiKey = key;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : "Failed to save Claude API key";
      });
      throw error;
    }
  }

  /**
   * Delete OpenAI API key
   */
  deleteOpenAiApiKey() {
    KeyService.deleteKey("openai_api_key");
    runInAction(() => {
      this.openAiApiKey = "";
    });
  }

  /**
   * Delete Gemini API key
   */
  deleteGeminiApiKey() {
    KeyService.deleteKey("gemini_api_key");
    runInAction(() => {
      this.geminiApiKey = "";
    });
  }

  /**
   * Delete Claude API key
   */
  deleteClaudeApiKey() {
    KeyService.deleteKey("claude_api_key");
    runInAction(() => {
      this.claudeApiKey = "";
    });
  }

  /**
   * Check if OpenAI API key exists
   */
  get hasOpenAiApiKey(): boolean {
    return KeyService.hasKey("openai_api_key");
  }

  /**
   * Check if Gemini API key exists
   */
  get hasGeminiApiKey(): boolean {
    return KeyService.hasKey("gemini_api_key");
  }

  /**
   * Check if Claude API key exists
   */
  get hasClaudeApiKey(): boolean {
    return KeyService.hasKey("claude_api_key");
  }

  /**
   * Get all API keys as an object
   */
  get allKeys(): ApiKeys {
    return {
      openAiApiKey: this.openAiApiKey,
      geminiApiKey: this.geminiApiKey,
      claudeApiKey: this.claudeApiKey,
    };
  }

  /**
   * Clear all API keys
   */
  clearAllKeys() {
    KeyService.clearAllKeys();
    runInAction(() => {
      this.openAiApiKey = "";
      this.geminiApiKey = "";
      this.claudeApiKey = "";
    });
  }

  /**
   * Refresh keys from storage
   */
  async refreshKeys() {
    await this.initializeKeys();
  }
}

export const keyStore = new KeyStore();
