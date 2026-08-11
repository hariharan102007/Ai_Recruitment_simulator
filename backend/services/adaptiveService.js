function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function probabilityCorrect(ability, difficulty) {
  // Higher ability relative to difficulty -> higher probability
  return sigmoid(ability - difficulty);
}

function updateAbility(currentAbility, difficulty, score, options = {}) {
  // score: numeric 0..1 (grader confidence / normalized score)
  const lr = options.lr ?? 0.8; // learning rate
  const p = probabilityCorrect(currentAbility, difficulty);
  // simple update: move ability toward score (centered by p)
  const delta = lr * (score - p);
  return currentAbility + delta;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function generateQuestion(ability) {
  // Pick a difficulty near the ability with some randomness
  const noise = (Math.random() * 2 - 1); // -1 .. 1
  let difficulty = ability + noise;
  difficulty = clamp(difficulty, -3, 3);

  // Map numeric difficulty to label and a simple template
  let label = 'medium';
  if (difficulty < -1) label = 'easy';
  else if (difficulty > 1) label = 'hard';

  const templates = {
    easy: [
      'Write a function that returns the sum of two numbers.',
      'Reverse a string input and return the result.',
    ],
    medium: [
      'Given an array of integers, find the first repeating element.',
      'Implement a function to check whether two strings are anagrams.',
    ],
    hard: [
      'Design an algorithm to find the longest increasing subsequence and return its length.',
      'Given a graph, implement Dijkstra\'s algorithm to find shortest path distances from a source node.',
    ],
  };

  const pool = templates[label] || templates.medium;
  const text = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    text,
    difficulty,
    label,
    // For many coding tasks, automatic answer checking isn't trivial; the API
    // will accept a `score` from the grader (0..1) when answering.
  };
}

export { generateQuestion, updateAbility, probabilityCorrect };
