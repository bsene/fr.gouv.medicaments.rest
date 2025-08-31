import {fileURLToPath} from "node:url";
import path from "node:path";

export const _filename = fileURLToPath(import.meta.url);
export const _dirname = path.dirname(_filename);