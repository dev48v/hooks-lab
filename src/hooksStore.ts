// External timeline store so logging hook activity never itself triggers a
// render of the demo component (which would pollute the very timeline we show).
// Read it from the panel with useSyncExternalStore.

export type Kind = "render" | "state" | "memo" | "effect" | "cleanup" | "ref" | "bail";
export type Entry = { id: number; group: number; kind: Kind; text: string };

let seq = 0;
let group = 0;
let entries: Entry[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const hooksStore = {
  newGroup() {
    group += 1;
    return group;
  },
  push(kind: Kind, text: string, g: number) {
    seq += 1;
    entries = [{ id: seq, group: g, kind, text }, ...entries].slice(0, 80);
    emit();
  },
  reset() {
    entries = [];
    group = 0;
    seq = 0;
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  get: () => entries,
};
