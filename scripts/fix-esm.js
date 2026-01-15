const { readdir, rename, readFile, writeFile } = require("fs/promises");
const { join } = require("path");

async function renameJsToMjs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await renameJsToMjs(fullPath);
    } else if (entry.name.endsWith(".js") && !entry.name.endsWith(".d.js")) {
      const newPath = fullPath.replace(/\.js$/, ".mjs");
      await rename(fullPath, newPath);

      // Update imports in the file
      let content = await readFile(newPath, "utf-8");
      content = content.replace(/from\s+"\.(.+?)\.js"/g, 'from ".$1.mjs"');
      await writeFile(newPath, content);
    } else if (entry.name.endsWith(".js.map")) {
      const newPath = fullPath.replace(/\.js\.map$/, ".mjs.map");
      await rename(fullPath, newPath);
    }
  }
}

renameJsToMjs("./dist/esm");
