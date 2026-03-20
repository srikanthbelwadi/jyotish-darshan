function getUTCOffset(tzId, year, month, day, hour, minute) {
    try {
      if (!year) {
        const d = new Date();
        year = d.getFullYear(); month = d.getMonth() + 1; day = d.getDate();
        hour = 12; minute = 0;
      }
      const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tzId,
        timeZoneName: 'shortOffset'
      }).formatToParts(d);
      const tzName = parts.find(p => p.type === 'timeZoneName')?.value;
      if (!tzName || tzName === 'GMT') return 0;
      const match = tzName.match(/GMT([+-]\d+)(?::(\d+))?/);
      if (match) {
        const hrs = parseInt(match[1], 10);
        const mins = match[2] ? parseInt(match[2], 10) : 0;
        return hrs + (hrs < 0 ? -mins/60 : mins/60);
      }
      return 5.5;
    } catch { return 5.5; }
}

console.log("Kolkata 2005-01-31 12:45 =>", getUTCOffset('Asia/Kolkata', 2005, 1, 31, 12, 45));
