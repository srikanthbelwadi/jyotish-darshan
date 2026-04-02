import handler from './api/kundali.js';

const req = {
  method: 'POST',
  headers: { authorization: 'Bearer MOCK_TOKEN' },
  body: {
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    lat: 28.6,
    lng: 77.2
  }
};

const res = {
  status: function(s) {
    this.statusCode = s;
    return this;
  },
  json: function(data) {
    console.log("STATUS:", this.statusCode);
    console.log("DATA:", data);
  }
};

(async () => {
   try {
     console.log("Simulating Vercel API...");
     await handler(req, res);
   } catch(e) {
     console.error("Uncaught exception in handler:", e);
   }
})();
