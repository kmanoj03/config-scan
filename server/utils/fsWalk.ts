import fs from 'fs/promises';
import path from 'path';

export async function findAllFiles(root: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            await walk(fullPath);
          }
        } else if (entry.isFile()) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn(`Warning: Could not read directory ${dirPath}`);
    }
  }

  try {
    await walk(root);
  } catch (error) {
    // If root doesn't exist or can't be read, return empty array
    console.warn(`Warning: Could not access root path ${root}`);
  }

  return results;
}
