import SwissEph from 'swisseph-wasm';
async function test() {
  const swisseph = new SwissEph();
  await swisseph.initSwissEph();
  swisseph.set_ephe_path(process.cwd() + '/public/sweph');
  let jd = swisseph.julday(1942, 10, 11, 16 - 6.5, swisseph.SE_GREG_CAL);
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED | swisseph.SEFLG_SIDEREAL;
  swisseph.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]);
  let plan = swisseph.calc_ut(jd, swisseph.SE_MERCURY, flags);
  console.log("Mercury:", plan[0]);
}
test();
