import React from "react";
import Typewriter from "typewriter-effect";

function Type() {
  return (
    <span className="type-line">
      <Typewriter
        options={{
          strings: [
            "React Developer",
            "TypeScript Developer",
            "Next.js Developer",
            "Web App Developer"
          ],
          autoStart: true,
          loop: true,
          deleteSpeed: 50
        }}
      />
    </span>
  );
}

export default Type;
