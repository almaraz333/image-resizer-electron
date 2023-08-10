const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const ResizeImg = require("resize-img");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageResizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  //Open dev tools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

//Create About Window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

//Menu Template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

// Respond to ipcRenderer Resize
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageResizer");
  resizeImage(options);
});

// Resize Image
async function resizeImage({ imgPath, height, width, dest }) {
  try {
    const newPath = await ResizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    const filename = path.basename(imgPath) + "-resized";

    // If dest folder doesnt exit then create it
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //Write File
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Send Success to render
    mainWindow.webContents.send("image:done");

    // Open dest folder
    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}

// app.on("ready", createMainWindow());
// App is ready
app.whenReady().then(() => {
  createMainWindow();

  // Implement Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove main window from memory when closed
  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (isMac) {
    app.quit();
  }
});
