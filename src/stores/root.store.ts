"use client";

import { documentStore } from "@/stores/document.store";
import { chatStore } from "@/stores/chat.store";
import { promptStore } from "@/stores/prompt.store";

export class RootStore {
  documentStore = documentStore;
  chatStore = chatStore;
  promptStore = promptStore;
}

export const rootStore = new RootStore();
