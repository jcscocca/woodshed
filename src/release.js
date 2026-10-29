// Vite replaces this value for each build. Node component harnesses and other
// direct module consumers retain a useful version without a bundler define.
export const RELEASE_ID = typeof __WOODSHED_RELEASE__ === "string" ? __WOODSHED_RELEASE__ : "local";
