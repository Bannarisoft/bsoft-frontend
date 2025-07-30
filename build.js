// build.js
const os = require("os");
const { execSync } = require("child_process");

const interfaces = os.networkInterfaces();
let localIP = "";

for (const iface of Object.values(interfaces)) {
  for (const alias of iface) {
    if (alias.family === "IPv4" && !alias.internal) {
      localIP = alias.address;
    }
  }
}

console.log("Detected local IP:", localIP);

let envFile = ".env.local"; // default

if (localIP === "192.168.1.130") {
  envFile = ".env.development";
} else if (localIP === "192.168.1.126") {
  envFile = ".env.local";
} else if (localIP === "192.168.1.135") {
  envFile = ".env.production";
} else {
  envFile = ".env.local";
  console.warn("Unknown IP, using default .env.development");
}

console.log(`Using env file: ${envFile}`);

try {
  execSync(`npx dotenv -e ${envFile} next build`, { stdio: "inherit" });
} catch (err) {
  console.error("❌ Failed to run build with dotenv. Is dotenv-cli installed?");
  process.exit(1);
}
