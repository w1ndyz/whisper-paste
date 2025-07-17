import { app, BrowserWindow, Menu, Tray } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

const inDevelopment = process.env.NODE_ENV === "development";

let tray: Tray | null = null;

function createWindow() {
  const windowWidth = 300;
  const windowHeight = 400;
  const preload = path.join(__dirname, "preload.js");
  const iconPath = path.join(__dirname, "../../src/assets/icons/icon.png");

  // Position window below menu bar on macOS
  let windowOptions: any = {
    width: windowWidth,
    height: windowHeight,
    icon: iconPath,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
    alwaysOnTop: true,
    titleBarStyle: "hidden",
  };

  if (process.platform === 'darwin') {
    // Position window at top-right corner below menu bar on macOS
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.workAreaSize;

    windowOptions.x = screenWidth - windowWidth - 10; // 10px margin from right edge
    windowOptions.y = 30; // Below menu bar (menu bar is ~25px)
  }

  const mainWindow = new BrowserWindow(windowOptions);
  registerListeners(mainWindow);

  // Hide window when it loses focus (clicking outside)
  mainWindow.on('blur', () => {
    mainWindow.hide();
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

function createTray() {
  // 使用绝对路径指向源文件
  const iconPath = path.resolve(__dirname, "../../src/assets/icons/icon.png");
  // console.log('Tray icon path:', iconPath);

  try {
    tray = new Tray(iconPath);

    // 为macOS调整图标
    if (process.platform === 'darwin') {
      tray.setImage(iconPath);
    }

    // console.log('Tray created successfully');

    const contextMenu = Menu.buildFromTemplate([
      // { label: '显示', click: () => {
      //   const allWindows = BrowserWindow.getAllWindows();
      //   if (allWindows.length > 0) {
      //     allWindows[0].show();
      //   } else {
      //     createWindow();
      //   }
      // }},
      { label: '退出', click: () => {
        app.quit();
      }}
    ]);

    tray.setToolTip('Electron ShadCN');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      const allWindows = BrowserWindow.getAllWindows();
      if (allWindows.length > 0) {
        allWindows[0].show();
      } else {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to create tray:', error);
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

app.whenReady().then(createWindow).then(createTray).then(installExtensions);

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends
