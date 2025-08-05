"use client";

import { documentStore } from "@/stores/document.store";
import { keyStore } from "@/stores/key.store";
import { chatStore } from "@/stores/chat.store";

export class RootStore {
  documentStore = documentStore;
  keyStore = keyStore;
  chatStore = chatStore;
}

export const rootStore = new RootStore();
