import { calcTreeHash, getGitLog } from '../infrastructure/git';
import { saveCachedLog } from '../infrastructure/log';
import { loadTreeHash, saveTreeHash } from '../infrastructure/tree-hash';
import { DETECTIVE_VERSION } from '../infrastructure/version';

export function isStale(): boolean {
  const lastHash = loadTreeHash();

  if (!lastHash) {
    return true;
  }

  const currentHash = calcVersionedHash();
  return currentHash !== lastHash;
}

export async function updateLogCache(): Promise<void> {
  const log = await getGitLog();
  saveCachedLog(log);

  const hash = calcVersionedHash();
  saveTreeHash(hash);
}

function calcVersionedHash() {
  return calcTreeHash() + ', v' + DETECTIVE_VERSION;
}
