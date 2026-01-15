const { readdir, rename, readFile, writeFile } = require("fs/promises");
const { join } = require("path");

async function renameJsToCjs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await renameJsToCjs(fullPath);
    } else if (entry.name.endsWith(".js")) {
      const newPath = fullPath.replace(/\.js$/, ".cjs");
      await rename(fullPath, newPath);

      // Update imports in the file
      let content = await readFile(newPath, "utf-8");
      content = content.replace(/require\("\.(.+?)\.js"\)/g, 'require(".$1.cjs")');
      content = content.replace(/require\("\.(.+?)"\)/g, (match, p1) => {
        if (!p1.endsWith(".cjs")) {
          return `require(".${p1}.cjs")`;
        }
        return match;
      });
      await writeFile(newPath, content);
    }
  }
}

renameJsToCjs("./dist/cjs");
