import React, { useState } from "react";

function BuildBreakdown({ project }) {
  const panels = [
    {
      id: "problem",
      label: "Problem",
      title: "What the work needed to solve",
      body: project.summary || project.description,
      items: project.tags || []
    },
    {
      id: "build",
      label: "Build",
      title: "What shipped",
      body: project.description,
      items: project.features || []
    },
    {
      id: "ownership",
      label: "Ownership",
      title: "What I drove",
      body: project.contribution || "I owned the implementation end to end.",
      items: [project.role, project.kind, project.year].filter(Boolean)
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activePanel = panels[activeIndex];

  return (
    <section className="build-breakdown" aria-label="Interactive build breakdown">
      <p className="eyebrow">Behind the build</p>
      <h2 className="display-2">How this case study came together</h2>
      <div
        className="build-tabs"
        role="tablist"
        aria-label="Choose a build phase"
      >
        {panels.map((panel, index) => (
          <button
            key={panel.id}
            role="tab"
            type="button"
            aria-selected={index === activeIndex}
            className={`build-tab${index === activeIndex ? " is-active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            {panel.label}
          </button>
        ))}
      </div>
      <div
        key={activePanel.id}
        role="tabpanel"
        className="build-panel"
        aria-labelledby={activePanel.id}
      >
        <h3 className="build-panel-title">{activePanel.title}</h3>
        <p className="build-panel-body body-copy">{activePanel.body}</p>
        {activePanel.items.length > 0 && (
          <ul className="build-panel-items">
            {activePanel.items.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default BuildBreakdown;