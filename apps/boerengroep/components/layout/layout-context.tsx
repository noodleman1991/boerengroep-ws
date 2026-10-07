"use client";
import React, { useState, useContext } from "react";
import type { GlobalSettings } from "@/lib/cms-adapters";

interface LayoutState {
  globalSettings: GlobalSettings;
  setGlobalSettings: React.Dispatch<
    React.SetStateAction<GlobalSettings>
  >;
  pageData: unknown;
  setPageData: React.Dispatch<React.SetStateAction<unknown>>;
  theme: GlobalSettings["theme"];
}

const LayoutContext = React.createContext<LayoutState | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  return (
    context || {
      theme: {
        color: "blue",
        darkMode: "default",
      },
      globalSettings: undefined,
      pageData: undefined,
    }
  );
};

interface LayoutProviderProps {
  children: React.ReactNode;
  globalSettings: GlobalSettings;
  pageData: unknown;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  globalSettings: initialGlobalSettings,
  pageData: initialPageData,
}) => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(
    initialGlobalSettings
  );
  const [pageData, setPageData] = useState<unknown>(initialPageData);

  const theme = globalSettings.theme;

  return (
    <LayoutContext.Provider
      value={{
        globalSettings,
        setGlobalSettings,
        pageData,
        setPageData,
        theme,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
