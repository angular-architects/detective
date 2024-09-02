'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.openSync = openSync;
var child_process_1 = require('child_process');
function openSync(url) {
  var command;
  switch (process.platform) {
    case 'darwin': // macOS
      command = 'open "'.concat(url, '"');
      break;
    case 'win32': // Windows
      command = 'start "" "'.concat(url, '"');
      break;
    case 'linux': // Linux
      command = 'xdg-open "'.concat(url, '"');
      break;
    default:
      console.error(
        'Cannot open the URL automatically on this platform: '.concat(
          process.platform
        )
      );
      return;
  }
  try {
    (0, child_process_1.execSync)(command);
  } catch (err) {
    console.error(
      'Failed to automatically open this URL in your browser: '.concat(
        err.message
      )
    );
  }
}
