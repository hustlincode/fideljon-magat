import React from "react";
import { LuVibrate, LuVibrateOff } from "react-icons/lu";

import useHapticsEnabled from "../../hooks/useHapticsEnabled";
import { haptic, setHapticsEnabled } from "../../lib/haptics";

// Visible on/off control for the haptic layer.
//
// The stylesheet only shows it on `(pointer: coarse)` devices: mouse-only
// desktops have no feedback hardware, and a permanently dead control is
// worse than no control. Phones and tablets get it next to the theme toggle.
//
// Behaviour:
//   - mute   -> the tap's own pointerdown buzz is the last one felt
//   - unmute -> one medium buzz fires immediately so the visitor feels what
//               they just switched on, without hunting for something to tap
//
// The icon swap reuses the theme toggle's pop animation (iconSwap), the
// preference persists in localStorage via lib/haptics, and aria-pressed
// mirrors the state for assistive tech.
function HapticToggle() {
  const enabled = useHapticsEnabled();

  const toggle = () => {
    const next = !enabled;
    setHapticsEnabled(next);
    if (next) haptic("medium");
  };

  return (
    <button
      type="button"
      className={`haptic-toggle${enabled ? "" : " is-off"}`}
      onClick={toggle}
      data-haptic="light"
      aria-pressed={enabled}
      aria-label={enabled ? "Turn off haptic feedback" : "Turn on haptic feedback"}
    >
      {enabled ? (
        <LuVibrate key="on" size={15} aria-hidden="true" />
      ) : (
        <LuVibrateOff key="off" size={15} aria-hidden="true" />
      )}
    </button>
  );
}

export default HapticToggle;
