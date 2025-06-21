import { app, BrowserWindow } from "electron";
// import { createRequire } from 'node:module'
import { fileURLToPath } from "node:url";
import path from "node:path";
// import {spawn } from 'child_process'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  });

  win.maximize();

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

// let backendProcess = null;
// function startBackend() {
//   return new Promise((resolve, reject) => {
//     // Check if the backend is already running
//     if (backendProcess) {
//       console.log("Backend is already running.");
//       return resolve();  // Resolve immediately if backend is already running
//     }

//     // Use quotes around the npm.cmd path to handle spaces in "Program Files"
//     const npmPath = '"C:/Program Files/nodejs/npm.cmd"';
//     const apiDirectory = path.join(__dirname, '..', '..', 'backend');  // Correct path to your backend

//     console.log(`Spawning backend process from: ${apiDirectory}`);

//     // Start the backend process
//     backendProcess = spawn(npmPath, ['start'], { cwd: apiDirectory, shell: true });

//     backendProcess.stdout.on('data', (data) => {
//       console.log(`Backend Output: ${data}`);
//     });

//     backendProcess.stderr.on('data', (data) => {
//       console.error(`Backend Error: ${data}`);
//     });

//     backendProcess.on('close', (code) => {
//       console.log(`Backend process exited with code ${code}`);
//       backendProcess = null;  // Reset flag when backend process exits
//       resolve(code);  // Resolve on success
//     });

//     backendProcess.on('error', (err) => {
//       console.error(`Error starting backend process: ${err.message}`);
//       backendProcess = null;  // Reset flag on error
//       reject(err);  // Reject on error
//     });
//   });
// }

// // Usage example
// startBackend()
//   .then((code) => {
//     console.log(`Backend started successfully with exit code ${code}`);
//   })
//   .catch((err) => {
//     console.error(`Error starting backend: ${err.message}`);
//  });

// app.whenReady().then(() => {
//   // Start the Express server (backend)
//   startBackend()

// })

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// app.on('ready' , () => {
//   const notification = new Notification({
//     title : 'Timetable Generator | Ista Cité De L\'air' ,
//     body : 'this is test global notification' ,
//   })
//   notification.show()
// })

app.setAppUserModelId("TimetableGenerator");

app.whenReady().then(createWindow);
