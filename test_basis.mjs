import { calculateMatch } from './api/engine/matchmaking.js';

const k1 = {
  name: "Srikanth",
  input: { gender: "male" },
  planets: [
    { key: "moon", longitude: 45 } // Taurus
  ]
};

const k2 = {
  name: "Priya",
  input: { gender: "female" },
  planets: [
    { key: "moon", longitude: 130 } // Leo
  ]
};

const match = calculateMatch(k1, k2);
console.log(JSON.stringify(match.ashtaKuta.elements, null, 2));
