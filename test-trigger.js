const fetch = require('node-fetch');

async function trigger() {
  try {
    const res = await fetch('http://localhost:3000/api/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'b9263ded-534f-4168-a3a8-626d26bc221a' }) // Using the dummy UUID we just created
    });
    const body = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", body);
  } catch (e) {
    console.error(e);
  }
}
trigger();
