import { useSyncExternalStore } from "react";
import { runStore } from "./runStore.js";

export const useRun = () => useSyncExternalStore(runStore.subscribe, runStore.get);
