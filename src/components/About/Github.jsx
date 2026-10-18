import React from "react";
import GitHubCalendar from "react-github-calendar";
import { useTheme } from "../../theme/ThemeContext";

// Ink scale for the contribution graph (marwieang pass): the chart is
// grayscale like the rest of the UI -- no chromatic accent remains.
const INK = {
  dark: "#ececee",
  light: "#17171a"
};

function Github() {
  const { theme } = useTheme();

  return (
    <div className="github-cal" style={{ marginTop: "clamp(40px, 6vh, 64px)" }}>
      <p className="eyebrow">Days I code</p>
      <GitHubCalendar
        username="hustlincode"
        blockSize={13}
        blockMargin={4}
        fontSize={13}
        color={INK[theme]}
      />
    </div>
  );
}

export default Github;
