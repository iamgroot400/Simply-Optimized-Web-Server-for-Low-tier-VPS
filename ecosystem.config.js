// PM2 process manager config for the backend API.
// Start with:  pm2 start ecosystem.config.js   (run from the project root)
module.exports = {
  apps: [
    {
      name: "student-doc-api",
      cwd: "./backend",
      script: "src/server.js",
      instances: 1,              // single instance — 1 CPU / 1GB VPS
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "350M", // restart if it ever balloons past 350MB
      env: { NODE_ENV: "production" },
      // The backend reads ./backend/.env via dotenv (cwd is ./backend).
    },
  ],
};
