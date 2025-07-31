"use client";

import { documentStore } from "@/stores/document.store";

export class RootStore {
  documentStore = documentStore;
}

export const rootStore = new RootStore();
