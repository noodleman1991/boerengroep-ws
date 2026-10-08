'use client';
import { createContext, type ReactNode, useContext } from 'react';
import type { BlockData } from '@/lib/block-data';

const EMPTY: BlockData = { events: [], episodes: [], news: [], positions: [], renderedAt: new Date(0).toISOString() };
const BlockDataContext = createContext<BlockData>(EMPTY);

export function BlockDataProvider({ value, children }: { value?: BlockData; children: ReactNode }) {
    return <BlockDataContext.Provider value={value ?? EMPTY}>{children}</BlockDataContext.Provider>;
}

/** Events and other shared content that the page loaded for its blocks. */
export const useBlockData = () => useContext(BlockDataContext);
