# ⚛️ React Hooks Lab

> **Watch React's core hooks fire in real time.** Click around and a live timeline shows you exactly which renders happen, when `useEffect` runs and cleans up, when `useMemo` recomputes vs. caches, and how `useRef` mutates *without* a render. Every line is a real event from a real component.

<p align="center">
  <a href="https://hooks-lab-seven.vercel.app/"><b>▶ Live demo</b></a> &nbsp;·&nbsp;
  <a href="#what-it-teaches">What it teaches</a> &nbsp;·&nbsp;
  <a href="#run-it-locally">Run locally</a>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-22d3ee" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61dafb" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646cff" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6" />
</p>

---

## Why

The hooks rules are easy to recite and easy to get wrong. *When* exactly does an effect re-run? Does typing in an unrelated input recompute my `useMemo`? Why didn't the screen update when I changed a ref? This lab answers all of those by **logging every hook event as it happens**, so cause and effect sit right next to each other.

## What it teaches

- **`useState` triggers a render** — and `setState` with the *same* value **bails out** (no render at all). There's a button for it; watch the timeline say "bailed".
- **`useEffect` runs after commit, and cleans up before the next run.** Bump `count` and you'll see `cleanup (was count=0)` immediately followed by `ran (count=1)`. The `[]` effect runs once, on mount.
- **Dependencies gate effects *and* memos.** Type in the `name` field → the component re-renders, but `useEffect[count]` is **skipped** and `useMemo` stays **cached**, because `count` didn't change. Change `count` → both fire.
- **`useRef` mutates without rendering.** Click "mutate ref" and the value changes in the timeline, but the number on screen stays stale until something *else* causes a render — the whole point of a ref.

## How it works

A small `hooksStore` (read via `useSyncExternalStore`) collects every event, so logging never re-renders the component being measured. The demo component logs its render reason (diffing previous state), logs inside the `useMemo` callback when it recomputes, and logs run/cleanup inside the effect. No dependencies beyond React. StrictMode is intentionally off, since it double-invokes renders/effects in dev and would double every line.

## Run it locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checked production build
```

## Contributing

Ideas: a `useReducer` track, `useCallback` referential-equality demo, `useLayoutEffect` vs `useEffect` timing, or a custom-hook composition view. PRs welcome.

**If this made hooks click, a ⭐ helps others find it.**

## License

MIT © [dev48v](https://github.com/dev48v)
