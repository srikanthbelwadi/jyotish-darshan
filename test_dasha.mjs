import { calculateChart } from './api/kundali.js';
const c = await calculateChart({year:1990, month:1, day:1, hour:12, minute:0, lat:28, lng:77, timezone:5.5});
console.log(JSON.stringify(c.dasha.mahadashas[0].antardashas?.slice(0,1), null, 2));
console.log(JSON.stringify(c.dasha.mahadashas[0].antars?.slice(0,1), null, 2));
