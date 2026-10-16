import { useSyncExternalStore } from "react";

import { isHapticsEnabled, subscribeHaptics } from "../lib/haptics";

// Reactive read of the persisted haptics preference for the toggle UI.
// The store lives at module level in lib/haptics, so useSyncExternalStore
// keeps any component in step with mute/unmute without prop drilling. The
// server snapshot is the default-on state, which also matches the first
// client paint before hydration catches up.
function useHapticsEnabled() {
  return useSyncExternalStore(subscribeHaptics, isHapticsEnabled, () => true);
}

export default useHapticsEnabled;
