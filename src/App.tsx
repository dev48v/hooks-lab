import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { hooksStore, type Kind } from "./hooksStore";

function Demo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [, setTick] = useState(0);

  const renderNo = useRef(0);
  const prev = useRef({ count: 0, name: "" });
  const gRef = useRef(0);
  const box = useRef(0); // mutated WITHOUT a render

  renderNo.current += 1;
  const g = renderNo.current;
  gRef.current = g;

  // why did this render happen?
  let reason: string;
  if (g === 1) reason = "first render (mount)";
  else {
    const ch: string[] = [];
    if (count !== prev.current.count) ch.push("count");
    if (name !== prev.current.name) ch.push("name");
    reason = ch.length ? "state changed: " + ch.join(", ") : "forced re-render (no state diff)";
  }
  hooksStore.push("render", `render #${g} — ${reason}`, g);

  // useMemo recomputes only when [count] changes
  const doubled = useMemo(() => {
    hooksStore.push("memo", `useMemo recomputed → expensive(${count}) = ${count * 2}`, gRef.current);
    return count * 2;
  }, [count]);
  if (g > 1 && count === prev.current.count) {
    hooksStore.push("memo", `useMemo cached (count unchanged) → ${doubled}`, g);
    hooksStore.push("effect", `useEffect[count] will be skipped (count unchanged)`, g);
  }

  // effect tied to [count]: runs after commit, cleans up before the next run
  useEffect(() => {
    hooksStore.push("effect", `useEffect[count] ran (count = ${count})`, gRef.current);
    return () => hooksStore.push("cleanup", `useEffect[count] cleanup (was count = ${count})`, gRef.current);
  }, [count]);

  // mount-only effect
  useEffect(() => {
    hooksStore.push("effect", "useEffect[] ran once — on mount", gRef.current);
  }, []);

  prev.current = { count, name };

  const mutateRef = () => {
    box.current += 1;
    hooksStore.push("ref", `ref.current = ${box.current}  (NO re-render — UI stays stale)`, gRef.current);
  };
  const setSame = () => {
    hooksStore.push("bail", `setCount(${count}) — same value → React bails out, no render`, gRef.current);
    setCount(count);
  };

  return (
    <div className="stage">
      <div className="readouts">
        <div className="ro">
          <div className="big">{count}</div>
          <div className="lbl">
            count <span className="hk">useState</span>
          </div>
        </div>
        <div className="ro">
          <div className="big">{doubled}</div>
          <div className="lbl">
            doubled <span className="hk">useMemo</span>
          </div>
        </div>
        <div className="ro">
          <div className="big">{box.current}</div>
          <div className="lbl">
            ref.current <span className="hk">useRef</span>
          </div>
        </div>
        <div className="ro">
          <div className="big">{renderNo.current}</div>
          <div className="lbl">renders so far</div>
        </div>
      </div>

      <div className="field">
        <label>
          name <span className="hk">useState</span> — type to re-render <i>without</i> touching count
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="type here…" spellCheck={false} />
      </div>

      <div className="controls">
        <button className="btn primary" onClick={() => setCount((c) => c + 1)}>count + 1</button>
        <button className="btn" onClick={setSame}>setCount(same) → bail</button>
        <button className="btn" onClick={mutateRef}>mutate ref ++ (no render)</button>
        <button className="btn" onClick={() => setTick((t) => t + 1)}>force re-render</button>
        <button className="btn ghost" onClick={() => hooksStore.reset()}>clear timeline</button>
      </div>
    </div>
  );
}

const KIND_LABEL: Record<Kind, string> = {
  render: "RENDER",
  state: "STATE",
  memo: "useMemo",
  effect: "useEffect",
  cleanup: "cleanup",
  ref: "useRef",
  bail: "bail-out",
};

function Timeline() {
  const entries = useSyncExternalStore(hooksStore.subscribe, hooksStore.get);
  return (
    <div className="panel">
      <h2>Timeline (newest first)</h2>
      {entries.length === 0 ? (
        <p className="muted">interact with the lab — every render, effect and memo is logged here.</p>
      ) : (
        <ul className="tl">
          {entries.map((e) => (
            <li key={e.id} className={`k-${e.kind}`}>
              <span className="g">#{e.group}</span>
              <span className="tag">{KIND_LABEL[e.kind]}</span>
              <span className="tx">{e.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="wrap">
      <header className="top">
        <h1>
          <span className="atom">⚛️</span> React Hooks Lab
        </h1>
        <a className="gh" href="https://github.com/dev48v/hooks-lab" target="_blank" rel="noopener">
          ★ Star on GitHub
        </a>
      </header>
      <p className="sub">
        Click around and watch React's core hooks fire in real time: which <b>renders</b> happen, when <code>useEffect</code>{" "}
        <b>runs and cleans up</b>, when <code>useMemo</code> <b>recomputes vs caches</b>, and how <code>useRef</code> mutates{" "}
        <b>without a render</b>. Every line in the timeline is a real event from a real component.
      </p>
      <div className="legend">
        <span><i className="d k-render" />render</span>
        <span><i className="d k-effect" />useEffect run</span>
        <span><i className="d k-cleanup" />cleanup</span>
        <span><i className="d k-memo" />useMemo</span>
        <span><i className="d k-ref" />useRef</span>
        <span><i className="d k-bail" />bail-out</span>
      </div>
      <div className="layout">
        <Demo />
        <Timeline />
      </div>
      <div className="tips">
        <b>Try this:</b> type in <code>name</code> &rarr; the component re-renders, but <code>useMemo</code> stays <b>cached</b> and{" "}
        <code>useEffect[count]</code> is <b>skipped</b> — because <code>count</code> didn't change. Now click <code>count + 1</code>{" "}
        &rarr; memo <b>recomputes</b> and the effect <b>cleans up then re-runs</b>. Click <b>mutate ref</b> &rarr; the value changes
        but nothing re-renders (the UI number stays stale until the next render). Click <b>setCount(same)</b> &rarr; React{" "}
        <b>bails out</b> entirely.
      </div>
      <footer>
        Real React 19 · every line is an actual hook event · <a href="https://dev48v.infy.uk">&larr; dev48v.infy.uk</a>
      </footer>
    </div>
  );
}
