"use client";

import { documentStore } from "@/stores/document.store";
import { keyStore } from "@/stores/key.store";

export class RootStore {
  documentStore = documentStore;
  keyStore = keyStore;
}

export const rootStore = new RootStore();
