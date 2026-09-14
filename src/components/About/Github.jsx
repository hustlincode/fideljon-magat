import React from "react";
import GitHubCalendar from "react-github-calendar";
import { useTheme } from "../../theme/ThemeContext";

const ACCENTS = {
  dark: "#ff7b1c",
  light: "#e8590c"
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
        color={ACCENTS[theme]}
      />
    </div>
  );
}

export default Github;
