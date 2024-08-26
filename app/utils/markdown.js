import he from 'he'
import TurndownService from 'turndown'
import { addFrontMatter } from './front-matter.js'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '*',
})

function isHtml(content) {
  return content.match(/<\/?[a-z][\s\S]*>/i)
}

function convertHtmlToMarkdown(content) {
  return turndownService.turndown(/* html */`
    <html>
      <body>
        ${content}
      </body>
    </html>  
  `)
}

function cleanContent(content) {
  content = content.replace(/\s{2,}/g, ' ')

  content = content.split('\n').map(line => line.trim()).join('\n')

  content = content.replace(/[^\x20-\x7E]/g, '')

  return content
}

function replaceAnnotations(content) {
  const annotationPattern = /\\\[annotation id="(\d+)"\\\]\s?(.*?)\\\[\/annotation\\\]/gs
  return content.replace(annotationPattern, ':annotation{id="$1"}[$2]')
}

function sanitizeContent(content) {
  return content
}

export function convert(content = '', metaData = {}) {
  content = he.decode(content)

  if (isHtml(content)) {
    content = convertHtmlToMarkdown(content)
  }
  else {
    metaData.isHtml = false
    content = cleanContent(content)
  }

  content = replaceAnnotations(content)
  content = sanitizeContent(content)
  content = addFrontMatter(content, metaData)

  return content
}
