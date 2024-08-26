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
  content = content.split('\n').map(line => line.trim()).join('\n')
  content = content.replace(/[\v\f\u00A0\u0085\u1680\u180E\uFEFF\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]/g, '')

  return content
}

function replaceAnnotations(content) {
  const annotationPattern = /\\\[annotation id="(\d+)"\\\]\s?(.*?)\\\[\/annotation\\\]/gs
  return content.replace(annotationPattern, ':annotation{id="$1"}[$2]')
}

export function convert(content = '', metaData = {}) {
  content = he.decode(content)

  if (isHtml(content)) {
    content = convertHtmlToMarkdown(content)
  }
  else {
    metaData.isHtml = false
  }

  content = cleanContent(content)
  content = replaceAnnotations(content)
  content = addFrontMatter(content, metaData)

  return content
}
