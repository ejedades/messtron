import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('darkMode', {
  apply: () => {
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';
  }
});
