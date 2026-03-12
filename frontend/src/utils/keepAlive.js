const BACKEND_URL = import.meta.env.VITE_API_URL;

export const startKeepAlive = () => {
  // ping backend every 10 minutes to prevent cold starts
  setInterval(async () => {
    try {
      await fetch(`${BACKEND_URL}/api/health`);
    } catch (err) {
      // silent fail
    }
  }, 10 * 60 * 1000);
};
