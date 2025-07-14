import { app, BrowserWindow } from "electron";
// import { createRequire } from 'node:module'
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import net from 'node:net';

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Backend process management
let backendProcess: ChildProcessWithoutNullStreams | null = null;

function startBackend() {
  return new Promise<void>((resolve, reject) => {
    // Check if backend is already running
    if (backendProcess) {
      return resolve();
    }

    // Check if backend is already running on port 8002
    const testSocket = new net.Socket();
    
    testSocket.on('error', () => {
      // Port is not in use, we can start the backend
      testSocket.destroy();
      
      const backendPath = path.join(__dirname, '..', '..', 'backend', 'index.js');
      const backendDir = path.join(__dirname, '..', '..', 'backend');

      // Start the backend process
      backendProcess = spawn('node', [backendPath], {
        cwd: backendDir,
        stdio: 'pipe', // Use pipe to capture output
        shell: false
      });

      // Handle backend output
      backendProcess.stdout?.on('data', (data) => {
        // Check if backend is ready (listening on port)
        if (data.toString().includes('High-performance server running on port')) {
          resolve();
        }
      });

      backendProcess.stderr?.on('data', (data) => {
        console.error(`Backend Error: ${data.toString().trim()}`);
      });

      backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
        backendProcess = null;
      });

      backendProcess.on('error', (err) => {
        console.error(`Error starting backend process: ${err.message}`);
        backendProcess = null;
        reject(err);
      });

      // Timeout after 10 seconds if backend doesn't start
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          resolve();
        }
      }, 10000);
    });

    testSocket.on('connect', () => {
      // Port is in use, backend is already running
      console.log('Backend is already running on port 8002');
      testSocket.destroy();
      resolve();
    });

    // Try to connect to port 8002
    testSocket.connect(8002, 'localhost');
  });
}

function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend process...');
    backendProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds if it doesn't stop gracefully
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log('Force killing backend process...');
        backendProcess.kill('SIGKILL');
      }
    }, 5000);
    
    backendProcess = null;
  }
}

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
    fullscreen: false, // Do not open in full screen
  });

  win.maximize(); // Start maximized

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app quit - stop backend
app.on('before-quit', () => {
  stopBackend();
});

// Handle process termination signals
process.on('SIGINT', () => {
  stopBackend();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopBackend();
  process.exit(0);
});

app.setAppUserModelId("TimetableGenerator");

// Start backend first, then create window
app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();
  } catch (error) {
    console.error('Failed to start backend:', error);
    // Still create window even if backend fails
    createWindow();
  }
});
