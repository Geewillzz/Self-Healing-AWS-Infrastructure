const express = require("express");
const app = express();
 
const PORT = process.env.PORT || 3000;
 
// Store memory leaks here (on purpose)
let memoryHog = [];
 
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Service is healthy íº€"
  });
});
 
// Crash the app
app.get("/crash", (req, res) => {
  res.send("Crashing the app now í²¥");
  process.exit(1);
});
 
// Gradually consume memory
app.get("/memory-leak", (req, res) => {
  setInterval(() => {
    memoryHog.push(Buffer.alloc(10 * 1024 * 1024)); // 10MB chunks
    console.log(`Memory chunks: ${memoryHog.length}`);
  }, 1000);
 
  res.send("Memory leak started í· í´¥");
});
 
// Spike CPU usage
app.get("/cpu-spike", (req, res) => {
  const start = Date.now();
  while (Date.now() - start < 15000) {
    Math.sqrt(Math.random());
  }
  res.send("CPU spike completed âš¡");
});
 
// Slow response
app.get("/slow", async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 15000));
  res.send("Sorry for the delay í°Œ");
});
 
app.listen(PORT, () => {
  console.log(`Breakable app running on port ${PORT}`);
});
 
