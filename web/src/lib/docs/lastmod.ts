import { execFileSync } from "node:child_process";

// Дата изменения раздела — последний коммит файла в репозитории бота; без git — неизвестна.
export function lastModified(filePath: string): Date | undefined {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", filePath], {
      cwd: filePath.slice(0, filePath.lastIndexOf("/")),
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out ? new Date(out) : undefined;
  } catch {
    return undefined;
  }
}
