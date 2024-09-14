import TurndownService from 'turndown'
import decode from './decode.js'
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

function transformAnnotations(content) {
  const annotationPattern = /\\\[annotation id="(\d+)"\\\]\s?(.*?)\\\[\/annotation\\\]/gs
  return content.replace(annotationPattern, ':annotation{:ids="[$1]"}[$2]')
}

function transformDonate(content) {
  const annotationPattern = /\\\[donate\\\]\s?(.*?)\\\[\/annotation\\\]/gs
  return content.replace(annotationPattern, ':donate[$1]')
}

function transformVideos(content) {
  const pattern = /\\\[content-video url="(.*?)"\\\]/g

  return content.replace(pattern, (_match, p1) => `\n\n::external-video{url="${p1}"}\n::\n\n`)
}

export function convert(content = '', metaData = {}) {
  content = decode(content)

  if (isHtml(content))
    content = convertHtmlToMarkdown(content)

  content = transformAnnotations(content)
  content = transformVideos(content)
  content = transformDonate(content)
  content = addFrontMatter(content, metaData)

  return content
}
