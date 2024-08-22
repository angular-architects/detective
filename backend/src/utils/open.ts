import { execSync } from 'child_process';

export function openSync(url: string): void {
    let command: string;

    switch (process.platform) {
        case 'darwin': // macOS
            command = `open "${url}"`;
            break;
        case 'win32': // Windows
            command = `start "" "${url}"`;
            break;
        case 'linux': // Linux
            command = `xdg-open "${url}"`;
            break;
        default:
            console.error(`Cannot open the URL automatically on this platform: ${process.platform}`);
            return;
    }

    try {
        execSync(command);
    } catch (err) {
        console.error(`Failed to automatically open this URL in your browser: ${(err as Error).message}`);
    }
}