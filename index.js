import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import he from 'he'
import TurndownService from 'turndown'

dotenv.config()

const turndownService = new TurndownService()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createDbConnection() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST || '',
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
  })
}

async function fetchWordPressPages(connection) {
  const [rows] = await connection.execute(`
    SELECT ID, post_title, post_content, post_parent
    FROM wp_posts
    WHERE post_type = "page"
    AND post_status = "publish"
  `)
  return rows
}

function convertTitleToSlug(page) {
  return page.post_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

function getPagePath(pages, page) {
  const parent = pages.find(page => page.ID === page.post_parent)

  if (parent) {
    return path.join(getPagePath(pages, parent), convertTitleToSlug(page))
  }

  return convertTitleToSlug(page)
}

function getFileName(page, pagePath) {
  if (page.post_parent === 0
    && page.post_title.toLowerCase() === 'onderzoek') {
    return 'index.md'
  }

  return `${path.basename(pagePath)}.md`
}

function isHtml(content) {
  return content.match(/<\/?[a-z][\s\S]*>/i)
}

function convertHtmlToMarkdown(content) {
  const markdown = turndownService.turndown(/* html */`
    <html>
      <body>
        ${content}
      </body>
    </html>  
  `)

  return replaceAnnotations(markdown)
}

function convertTextToMarkdown(content) {
  return content
}

function replaceAnnotations(content) {
  const annotationPattern = /\\\[annotation id="(\d+)"\\\](.*?)\\\[\/annotation\\\]/gs
  return content.replace(annotationPattern, ':annotation{id="$1"}[$2]')
}

function convertContent(content) {
  return isHtml(content)
    ? convertHtmlToMarkdown(content)
    : convertTextToMarkdown(content)
}

function saveContent(pages, page) {
  const content = he.decode(page.post_content)

  const pagePath = getPagePath(pages, page)
  const dirPath = path.join(__dirname, 'export', path.dirname(pagePath))

  fs.mkdirSync(dirPath, { recursive: true })

  const filePath = path.join(dirPath, getFileName(page, pagePath))

  fs.writeFileSync(filePath, convertContent(content))
}

async function convertWpToMd() {
  const connection = await createDbConnection()
  const pages = await fetchWordPressPages(connection)

  pages.forEach(page => saveContent(pages, page))

  await connection.end()
}

convertWpToMd().catch(err => console.error(err))
