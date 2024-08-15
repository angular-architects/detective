import { Options } from "./options";
import fs from "fs";

export function validateOptions(options: Options) {
  try {
    if (!fs.existsSync(options.config)) {
      fs.writeFileSync(options.config, "{}", "utf-8");
    }
    if (!fs.existsSync(options.sheriffDump)) {
      console.error("Dump does not exist: ", options.sheriffDump);
      return false;
    }
    if (!options.port) {
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
}
