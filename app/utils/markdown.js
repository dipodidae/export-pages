import TurndownService from 'turndown'
import { addFrontMatter } from './front-matter.js'
import decode from './decode.js'

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

function transformAnnotations(content) {
  const annotationPattern = /\\\[annotation id="(\d+)"\\\]\s?(.*?)\\\[\/annotation\\\]/gs
  return content.replace(annotationPattern, ':annotation{id="$1"}[$2]')
}

function transformVideos(content) {
  const pattern = /\\\[content-video url="(.*?)"\\\]/g

  return content.replace(pattern, (_match, p1) => {
    return `\n\n::content-video{url="${p1}"}\n::\n\n`
  })
}

export function convert(content = '', metaData = {}) {
  content = decode(content)

  if (isHtml(content)) {
    content = convertHtmlToMarkdown(content)
  }

  content = transformAnnotations(content)
  content = transformVideos(content)
  content = addFrontMatter(content, metaData)

  return content
}
