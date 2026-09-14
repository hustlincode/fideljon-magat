import React from "react";

const TIMELINE = [
  {
    year: "2025",
    title: "Junior Software Developer",
    company: "Servo IT Solutions OPC"
  },
  {
    year: "2024",
    title: "Associate Software Developer",
    company: "Servo IT Solutions OPC"
  },
  {
    year: "2024",
    title: "BS Information Technology",
    company: "Pampanga State Agricultural University"
  },
  {
    year: "2021",
    title: "Hello World!",
    company: "Wrote my first line of code"
  }
];

function Timeline() {
  return (
    <div>
      <p className="eyebrow" style={{ marginTop: "clamp(40px, 6vh, 64px)" }}>
        Career journey
      </p>
      <div className="timeline">
        {TIMELINE.map((item) => (
          <div className="timeline-row" key={`${item.year}-${item.title}`}>
            <span className="timeline-year">{item.year}</span>
            <span className="timeline-role">{item.title}</span>
            <span className="timeline-company">{item.company}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
