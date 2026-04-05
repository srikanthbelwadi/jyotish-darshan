import { computeKundali } from './api/engine/vedic.js';
const p = computeKundali({year: 1990, month: 1, day: 1, hour: 12, minute: 0, lat: 28, lng: 77});
console.log(JSON.stringify(p.dasha.mahadashas[0].antardashas[0], null, 2));
