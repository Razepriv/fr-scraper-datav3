import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

// Set global options
setGlobalOptions({
  maxInstances: 10,
  memory: "1GiB",
  timeoutSeconds: 60,
});

// For now, we'll keep it simple and just return a basic response
// Full Next.js integration would require more complex setup
export const nextjsFunc = onRequest(async (req, res) => {
  res.status(200).json({ 
    message: "Server functions are enabled. Full Next.js SSR integration would require additional setup." 
  });
});

// Basic API endpoint for testing
export const api = onRequest(async (req, res) => {
  res.status(200).json({ 
    status: "ok",
    message: "Firebase Functions are working",
    timestamp: new Date().toISOString()
  });
});