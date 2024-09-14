import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.resolve(__dirname, '../..')

/**
 * Saves content to a file, creating directories as needed.
 *
 * @param {string} filename - The name of the file to save.
 * @param {string} [content] - The content to write to the file.
 */
export function save(filename, content = '') {
  const dirPath = path.join(rootDir, 'export')
  const filePath = path.join(dirPath, filename)
  const fileDir = path.dirname(filePath)

  fs.mkdirSync(fileDir, { recursive: true })

  fs.writeFileSync(filePath, content)
}
