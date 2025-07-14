import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawn } from "child_process";
import net from "node:net";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let backendProcess = null;
function startBackend() {
  return new Promise((resolve, reject) => {
    if (backendProcess) {
      return resolve();
    }
    const testSocket = new net.Socket();
    testSocket.on("error", () => {
      var _a, _b;
      testSocket.destroy();
      const backendPath = path.join(__dirname, "..", "..", "backend", "index.js");
      const backendDir = path.join(__dirname, "..", "..", "backend");
      backendProcess = spawn("node", [backendPath], {
        cwd: backendDir,
        stdio: "pipe",
        // Use pipe to capture output
        shell: false
      });
      (_a = backendProcess.stdout) == null ? void 0 : _a.on("data", (data) => {
        if (data.toString().includes("High-performance server running on port")) {
          resolve();
        }
      });
      (_b = backendProcess.stderr) == null ? void 0 : _b.on("data", (data) => {
        console.error(`Backend Error: ${data.toString().trim()}`);
      });
      backendProcess.on("close", (code) => {
        console.log(`Backend process exited with code ${code}`);
        backendProcess = null;
      });
      backendProcess.on("error", (err) => {
        console.error(`Error starting backend process: ${err.message}`);
        backendProcess = null;
        reject(err);
      });
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          resolve();
        }
      }, 1e4);
    });
    testSocket.on("connect", () => {
      console.log("Backend is already running on port 8002");
      testSocket.destroy();
      resolve();
    });
    testSocket.connect(8002, "localhost");
  });
}
function stopBackend() {
  if (backendProcess) {
    console.log("Stopping backend process...");
    backendProcess.kill("SIGTERM");
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log("Force killing backend process...");
        backendProcess.kill("SIGKILL");
      }
    }, 5e3);
    backendProcess = null;
  }
}
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    },
    fullscreen: false
    // Do not open in full screen
  });
  win.maximize();
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("before-quit", () => {
  stopBackend();
});
process.on("SIGINT", () => {
  stopBackend();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stopBackend();
  process.exit(0);
});
app.setAppUserModelId("TimetableGenerator");
app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();
  } catch (error) {
    console.error("Failed to start backend:", error);
    createWindow();
  }
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
