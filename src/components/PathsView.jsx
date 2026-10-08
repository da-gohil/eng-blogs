import { useEffect, useRef } from "react";
import { PATH_BY_ID, PATHS } from "../data/paths.js";
import { RESOURCE_BY_ID } from "../data/resources/index.js";
import { CompactResource } from "./ResourceCard.jsx";
import Icon from "./Icon.jsx";
import PathCard, { ProgressBar } from "./PathCard.jsx";

function Step({ step, index, done, onToggle, savedIds, onToggleSave }) {
  const checkboxId = `step-${step.id}`;
  return (
    <li className={`step${done ? " is-done" : ""}`}>
      <div className="step__marker" aria-hidden="true">
        {done ? <Icon name="check" size={16} /> : index + 1}
      </div>
      <div className="step__card">
        <div className="step__head">
          <h3 className="step__title">{step.title}</h3>
          <span className="step__duration">
            <Icon name="clock" size={14} /> {step.duration}
          </span>
        </div>
        <p className="step__body">{step.body}</p>
        <ul className="step__resources">
          {step.resources.map((id) => {
            const resource = RESOURCE_BY_ID.get(id);
            return (
              <li key={id}>
                <CompactResource resource={resource} saved={savedIds.has(id)} onToggleSave={onToggleSave} />
              </li>
            );
          })}
        </ul>
        {step.links?.length > 0 && (
          <ul className="step__links">
            {step.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label} <Icon name="arrow-up-right" size={13} />
                </a>
              </li>
            ))}
          </ul>
        )}
        <label className="step__check" htmlFor={checkboxId}>
          <input id={checkboxId} type="checkbox" checked={done} onChange={onToggle} />
          <span>{done ? "Done — nice work" : "Mark step as done"}</span>
        </label>
      </div>
    </li>
  );
}

export default function PathsView({ pathId, progress, onToggleStep, onResetPath, savedIds, onToggleSave }) {
  const path = PATH_BY_ID.get(pathId) ?? PATHS[0];
  const doneSteps = new Set(progress[path.id] ?? []);
  const doneCount = path.steps.filter((step) => doneSteps.has(step.id)).length;
  const navRef = useRef(null);

  // On narrow screens the path picker scrolls sideways; keep the active path visible.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector('[aria-current="true"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: active.offsetLeft - nav.offsetLeft - 16 });
  }, [path.id]);

  return (
    <div className="container page">
      <header className="page-head">
        <p className="eyebrow">
          <Icon name="route" size={14} /> Learning paths
        </p>
        <h1 className="page-title">Roadmaps that make you a better engineer</h1>
        <p className="page-sub">
          Opinionated, step-by-step routes through the best resources in the directory. Check off steps as you go —
          progress is saved in this browser.
        </p>
      </header>

      <div className="paths-layout">
        <nav className="paths-nav" aria-label="Learning paths" ref={navRef}>
          {PATHS.map((item) => (
            <PathCard
              key={item.id}
              path={item}
              active={item.id === path.id}
              done={item.steps.filter((step) => (progress[item.id] ?? []).includes(step.id)).length}
            />
          ))}
        </nav>

        <article className="path" aria-labelledby="path-title">
          <header className="path__head">
            <span className="path__icon">
              <Icon name={path.icon} size={24} />
            </span>
            <div>
              <h2 id="path-title" className="path__title">
                {path.title}
              </h2>
              <p className="path__summary">{path.summary}</p>
            </div>
            <dl className="path__meta">
              <div>
                <dt>Level</dt>
                <dd>{path.level}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{path.duration}</dd>
              </div>
              <div>
                <dt>Steps</dt>
                <dd>{path.steps.length}</dd>
              </div>
            </dl>
            <div className="path__progress">
              <ProgressBar done={doneCount} total={path.steps.length} label={`${path.title} progress`} />
              {doneCount > 0 && (
                <button type="button" className="link-btn" onClick={() => onResetPath(path.id)}>
                  <Icon name="reset" size={14} /> Reset
                </button>
              )}
            </div>
          </header>

          <ol className="steps">
            {path.steps.map((step, index) => (
              <Step
                key={step.id}
                step={step}
                index={index}
                done={doneSteps.has(step.id)}
                onToggle={() => onToggleStep(path.id, step.id)}
                savedIds={savedIds}
                onToggleSave={onToggleSave}
              />
            ))}
          </ol>
        </article>
      </div>
    </div>
  );
}
