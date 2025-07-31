"use client";

import { createContext, useContext, type ReactNode } from "react";
import { RootStore, rootStore } from "../stores/root.store";

export const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

export const useStores = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStores must be used within a StoreProvider");
  }
  return store;
};
