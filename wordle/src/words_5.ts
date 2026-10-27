import guesses from "./guesses_5";
import solutions from "./solutions_5";

// Only words from the solution list that are also accepted guesses can be
// answers. This keeps the full list intact, but skips solutions that are not
// in the current guess list (non-German fixes or fixes dropped by a newer
// AIRAC).
const activeSolutions = solutions.filter((word) => guesses.includes(word));
const activeSolutionSet = new Set(activeSolutions);

const words = {
    "words": activeSolutions,
    // "valid" holds guesses that cannot be solutions; "words" above is ORed
    // with it by words.contains(), so every guess in guesses_5.ts is accepted.
    "valid": guesses.filter((word) => !activeSolutionSet.has(word))
};
export default words;
