const http = require('http');

const NUM_REQUESTS = 50;
const URL = 'http://localhost:3000/api/cover?title=test';

let completed_requests = 0;
let successful_requests = 0;

console.log(`Starting load test with ${NUM_REQUESTS} concurrent requests...`);

for (let i = 0; i < NUM_REQUESTS; i++) {
  http.get(URL, (res) => {
    if (res.statusCode === 200) {
      successful_requests++;
    }
    res.on('data', () => {}); // consume data to free up memory
    res.on('end', () => {
      completed_requests++;
      if (completed_requests === NUM_REQUESTS) {
        console.log('Load test finished.');
        console.log(`Successful requests: ${successful_requests}/${NUM_REQUESTS}`);
      }
    });
  }).on('error', (err) => {
    console.error(`Request error: ${err.message}`);
    completed_requests++;
    if (completed_requests === NUM_REQUESTS) {
      console.log('Load test finished.');
      console.log(`Successful requests: ${successful_requests}/${NUM_REQUESTS}`);
    }
  });
}
