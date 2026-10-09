import AppLink from "./AppLink.jsx";
import Icon from "./Icon.jsx";

export function ProgressBar({ done, total, label }) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="progress">
      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={label}
        aria-valuetext={`${done} of ${total} steps done`}
      >
        <div className={`progress__fill${percent === 100 ? " is-complete" : ""}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="progress__text">{done === total && total > 0 ? "Completed" : `${done}/${total} steps`}</span>
    </div>
  );
}

/** A learning-path summary card; links to the path inside the Paths view. */
export default function PathCard({ path, done, active = false }) {
  return (
    <AppLink
      to={{ view: "paths", path: path.id }}
      className={`path-card${active ? " is-active" : ""}`}
      aria-current={active ? "true" : undefined}
    >
      <span className="path-card__icon">
        <Icon name={path.icon} size={20} />
      </span>
      <span className="path-card__title">{path.title}</span>
      <span className="path-card__summary">{path.summary}</span>
      <span className="path-card__meta">
        <span>
          <Icon name="signal" size={14} /> {path.level}
        </span>
        <span>
          <Icon name="clock" size={14} /> {path.duration}
        </span>
      </span>
      <ProgressBar done={done} total={path.steps.length} label={`${path.title} progress`} />
    </AppLink>
  );
}
