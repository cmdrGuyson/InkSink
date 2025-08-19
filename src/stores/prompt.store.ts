import { PromptInsert, PromptService, Prompt } from "@/services/prompt.service";
import { makeAutoObservable, runInAction } from "mobx";

class PromptStore {
  loading: boolean = false;
  error: string | null = null;
  prompts: Prompt[] = [];

  loadingSelectedPrompt: boolean = false;
  selectedPrompt: Prompt | null = null;

  constructor() {
    makeAutoObservable(this);

    // Automatically fetch prompts when store is initialized
    this.fetchPrompts();
  }

  async fetchPrompts() {
    this.loading = true;
    this.error = null;
    try {
      const prompts = await PromptService.getAllUserPrompts();
      runInAction(() => {
        this.prompts = prompts;
        this.loading = false;
      });
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to fetch prompts";
        this.loading = false;
      });
    }
  }

  async createPrompt(data: PromptInsert) {
    this.error = null;
    try {
      const prompt = await PromptService.createPrompt(data);
      runInAction(() => {
        this.prompts.unshift(prompt);
      });
      return prompt;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to create prompt";
      });
      throw e;
    }
  }

  async getPromptById(id: string) {
    this.loadingSelectedPrompt = true;
    this.error = null;
    try {
      const prompt = await PromptService.getPromptById(id);
      runInAction(() => {
        this.selectedPrompt = prompt;
        this.loadingSelectedPrompt = false;
      });
      return prompt;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to fetch prompt";
        this.loadingSelectedPrompt = false;
      });
    }
  }

  async updatePrompt(
    id: string,
    data: { title?: string; content?: string; description?: string }
  ) {
    this.error = null;
    try {
      const updatedPrompt = await PromptService.updatePrompt(id, data);

      runInAction(() => {
        // Update selected prompt if it's the one being updated
        if (this.selectedPrompt?.id === id) {
          this.selectedPrompt = updatedPrompt;
        }

        // Update prompt in the prompts list
        const promptIndex = this.prompts.findIndex(
          (prompt) => prompt.id === id
        );
        if (promptIndex !== -1) {
          this.prompts[promptIndex] = {
            ...this.prompts[promptIndex],
            title: updatedPrompt.title,
            description: updatedPrompt.description,
            updated_at: updatedPrompt.updated_at,
          };
        }
      });

      return updatedPrompt;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to update prompt";
      });
      throw e;
    }
  }

  async deletePrompt(id: string) {
    this.error = null;
    try {
      await PromptService.deletePrompt(id);

      runInAction(() => {
        // Remove from prompts list
        this.prompts = this.prompts.filter((prompt) => prompt.id !== id);

        // Clear selected prompt if it's the one being deleted
        if (this.selectedPrompt?.id === id) {
          this.selectedPrompt = null;
        }
      });

      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to delete prompt";
      });
      throw e;
    }
  }

  clearError() {
    this.error = null;
  }

  clearSelectedPrompt() {
    this.selectedPrompt = null;
  }
}

export const promptStore = new PromptStore();
