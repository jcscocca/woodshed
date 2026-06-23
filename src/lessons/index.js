import guitar from "./guitar.js";
import piano from "./piano.js";
import bass from "./bass.js";
import accordion from "./accordion.js";

// Lessons are static content keyed by exercise/stage id. They are looked up at
// render time and never written to storage, so updates reach existing users.
export const LESSONS = { ...guitar, ...piano, ...bass, ...accordion };
export const getLesson = (id) => LESSONS[id] || null;
