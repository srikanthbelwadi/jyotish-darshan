import SwissEph from 'swisseph-wasm';
const s = new SwissEph();
await s.initSwissEph();
console.log(s.SweModule.FS !== undefined);
