function getUTCOffset(tzId, year, month, day, hour, minute) {
  try {
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const str = new Intl.DateTimeFormat('en-US', {
      timeZone: tzId,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    }).format(utcDate);
    
    // Debug
    console.log("str inside getUTCOffset:", str);
    
    const [datePart, timePart] = str.split(', ');
    const [m, d, y] = datePart.split('/');
    let [h, min, s] = timePart.split(':');
    if (h === '24') h = '00';
    
    const targetTimeAsUTC = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s)));
    const offsetMs = targetTimeAsUTC.getTime() - utcDate.getTime();
    return offsetMs / 3600000;
  } catch (err) {
    console.error("Error inside getUTCOffset:", err);
    return 5.5; 
  } 
}

console.log('Tested offset:', getUTCOffset('Asia/Kolkata', 2005, 1, 31, 12, 45));
