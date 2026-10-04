import { useSyncExternalStore } from "react";
import { HOTEL_PROFILE, type ContentProfile } from "./contentProfile";

/** Demo brand state: whether this hotel has a brand profile, and the profile itself (browser only). */
type BrandState = { hasBranding: boolean; profile: ContentProfile; created: ContentProfile | null };

const KEY = "directful.brand.v1";
const initial: BrandState = { hasBranding: true, profile: HOTEL_PROFILE, created: null };
let state: BrandState = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...(JSON.parse(raw) as Partial<BrandState>) };
  } catch {
    /* ignore */
  }
}

function set(next: Partial<BrandState>) {
  state = { ...state, ...next };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export const brandStore = {
  get: () => (load(), state),
  /** Simulates a hotel with or without an existing brand profile. */
  setHasBranding: (hasBranding: boolean) => set({ hasBranding }),
  saveProfile: (profile: ContentProfile) =>
    set(state.hasBranding ? { profile: { ...profile, defined: true } } : { created: { ...profile, defined: true } }),
  reset: () => set({ profile: HOTEL_PROFILE, created: null }),
};

/** The profile the AI should currently use, or null when the hotel has none yet. */
export function activeProfile(s: BrandState): ContentProfile | null {
  return s.hasBranding ? s.profile : s.created;
}

export function useBrand() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => brandStore.get(),
    () => initial,
  );
}
