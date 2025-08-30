// 预载隔离层：如需暴露安全 API，可在此加上
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('SeafarNexusBridge', {
  // 未来要加本机功能时在这儿扩充
});
