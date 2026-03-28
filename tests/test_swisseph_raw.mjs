import SwissEph from 'swisseph-wasm';
async function test() {
  const swisseph = new SwissEph();
  await swisseph.initSwissEph();
  swisseph.set_ephe_path(process.cwd() + '/public/sweph');
  let jd = swisseph.julday(1869, 10, 2, 2.55, swisseph.SE_GREG_CAL);
  console.log("Gandhi JD_UT:", jd);
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED | swisseph.SEFLG_SIDEREAL;
  swisseph.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]);
  let moon = swisseph.calc_ut(jd, swisseph.SE_MOON, flags);
  console.log("Moon:", moon[0]);
}
test();
