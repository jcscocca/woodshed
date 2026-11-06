// The Catalogue shelf: music only. Course pieces open in the practice sheet,
// repertoire opens the older lesson sheet, outside pieces are links.
// Levels were set by reading each score; they filter but are never shown.
import { EXTERNAL_MUSIC } from "./guides.js";

export const LEVELS = ["Easier", "Middle", "Harder"];
export const SHELF_GROUPS = [{ id: "course", label: "Course pieces" }, { id: "repertoire", label: "Repertoire" }, { id: "outside", label: "Outside Woodshed" }];

const course = (exerciseId, title, who, level, extra = {}) => ({ id: `shelf-${exerciseId}`, group: "course", exerciseId, title, who, level, ...extra });
const repertoire = (lessonId, title, who, level) => ({ id: `shelf-${lessonId}`, group: "repertoire", lessonId, title, who, level });
const outside = (externalId, title, who, level) => ({ id: `shelf-${externalId}`, group: "outside", url: EXTERNAL_MUSIC.find((e) => e.id === externalId).url, title, who, level });

export const SHELF = [
  course("music-night-windows", "Night windows", "Original study", "Easier"),
  course("music-evening-signals", "Evening signals", "Original study", "Easier", { substitutesFor: ["music-night-windows"] }),
  course("music-ode-opening", "Ode to Joy: opening", "Beethoven, arr.", "Easier"),
  course("music-lantern-walk", "Lantern walk", "Original study", "Easier"),
  course("music-after-rain", "After the rain", "Original, cinematic style", "Middle"),
  course("music-dawn-drive", "Dawn drive", "Original study", "Middle"),
  course("g-music-northern-lights", "Northern lights", "Original study", "Easier"),
  course("g-music-blue-hour", "Blue hour", "Original study", "Easier", { substitutesFor: ["g-music-northern-lights"] }),
  course("g-music-paper-lanterns", "Paper lanterns", "Original, pop style", "Middle"),
  course("g-music-little-promenade", "Little promenade", "Original, classical style", "Easier"),
  course("g-music-first-train", "First train", "Original study", "Middle"),
  course("g-music-homeward", "Homeward", "Original study", "Middle"),
  course("f3-music-harbor-light", "Harbor light", "Original study", "Easier"),
  course("f3-music-field-lanterns", "Field lanterns", "Original study", "Easier", { substitutesFor: ["f3-music-harbor-light"] }),
  course("f3-music-courtyard", "Courtyard conversation", "Original, classical style", "Easier"),
  course("f3-music-shore-waltz", "Shore waltz", "Original waltz", "Easier"),
  course("f3-music-paper-boats", "Paper boats", "Original, pop style", "Middle"),
  course("a4-fur-elise-opening", "Für Elise: opening", "Beethoven", "Middle"),
  course("d-canon-blocks", "Canon: held chords", "Pachelbel, arr.", "Easier"),
  course("d-canon-bass-chords", "Canon: moving bass", "Pachelbel, arr.", "Middle"),
  course("a6-mozart-held", "Sonata K.331: opening", "Mozart, arr.", "Middle"),
  course("a6-mozart-two-pulse", "Sonata K.331: opening, fuller bass", "Mozart, arr.", "Middle"),
  course("a6-two-rooms", "Two Rooms", "Original, AB form", "Middle"),
  course("e7-morning-arrangement", "Morning Mood", "Grieg, arr.", "Middle"),
  course("e7-switchyard-blues", "Switchyard twelve", "Original 12-bar blues", "Middle"),
  course("m8-form-ab", "Two-part Conversation", "Original, AB form", "Easier"),
  course("m8-form-aba", "Return Dance", "Original, ABA form", "Easier"),
  repertoire("pop-ode-to-joy", "Ode to Joy", "Beethoven, lead sheet", "Middle"),
  repertoire("pop-amazing-grace", "Amazing Grace", "Traditional, lead sheet", "Middle"),
  repertoire("pno-minuet", "Minuet in G", "Petzold", "Harder"),
  repertoire("pcs-minuet-gmin", "Minuet in G minor", "Petzold", "Harder"),
  repertoire("pcs-musette", "Musette in D", "Anonymous, Anna Magdalena notebook", "Harder"),
  repertoire("pcs-schumann-melody", "Melody", "Schumann", "Harder"),
  repertoire("pcs-soldiers-march", "Soldier's March", "Schumann", "Harder"),
  repertoire("pcs-la-candeur", "La Candeur", "Burgmüller", "Harder"),
  repertoire("pcs-clementi-36-1", "Sonatina in C, first movement", "Clementi", "Harder"),
  repertoire("pcs-arabesque", "Arabesque", "Burgmüller", "Harder"),
  repertoire("pcs-bach-prelude-c", "Prelude in C", "Bach · Mutopia", "Harder"),
  repertoire("pcs-old-french-song", "Old French Song", "Tchaikovsky · Mutopia", "Harder"),
  repertoire("pcs-gymnopedie-1", "Gymnopédie No. 1", "Satie · Mutopia", "Harder"),
  outside("external-star-wars-beginning", "Star Wars for Beginning Piano", "Hal Leonard book", "Middle"),
  outside("external-disney-simple", "Simple Disney Songs", "Hal Leonard book", "Harder"),
  outside("external-ghibli-entry", "Studio Ghibli Favorites for Beginners 2", "Yamaha book", "Middle"),
];

export const unitHeading = (unit, current) => `${unit.key === "Across keys" ? "Musicianship" : unit.key} · Unit ${unit.number}${current ? " · you're here" : ""}`;
