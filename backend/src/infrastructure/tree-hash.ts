import * as fs from "fs";
import * as path from "path";
import { DETECTIVE_DIR, HASH_FILE } from "./paths";

const hashFile = path.join(DETECTIVE_DIR, HASH_FILE);

export function loadTreeHash(): string | null {
  if (!fs.existsSync(hashFile)) {
    return null;
  }

  return fs.readFileSync(hashFile, "utf-8");
}

export function saveTreeHash(hash: string): void {
  fs.writeFileSync(hashFile, hash, "utf-8");
}
