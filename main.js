// Electron 主程序：载入你现有前端（不修改你的程式逻辑）
const { app, BrowserWindow, nativeTheme, protocol } = require('electron');
const path = require('path');
const url = require('url');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.once('ready-to-show', () => win.show());

  // 你的网页程式的入口（请确保 app/ 下有 index.html）
  const indexPath = path.join(__dirname, 'app', 'index.html');
  win.loadURL(url.pathToFileURL(indexPath).toString());

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(() => {
  // 若你有用到相对资源/路由，可用自定义协议辅助（可按需扩充）
  protocol.registerFileProtocol('app', (request, callback) => {
    const requestedUrl = request.url.replace('app://', '');
    const resolvedPath = path.join(__dirname, requestedUrl);
    callback({ path: resolvedPath });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
