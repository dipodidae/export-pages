import TurndownService from 'turndown'
import decode from './decode.js'
import { addFrontMatter } from './front-matter.js'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '*',
})

/**
 * Checks if the content is HTML.
 *
 * @param {string} content - The content to check.
 * @returns {boolean} True if the content is HTML, false otherwise.
 */
function isHtml(content) {
  return content.match(/<\/?[a-z][\s\S]*>/i)
}

/**
 * Removes <a> tags that contain <img> tags, leaving only the <img> tags.
 *
 * @param {string} content - The HTML content to process.
 * @returns {string} The processed HTML content with <a> tags containing <img> tags removed.
 */
function removeATagsWithImages(content) {
  const pattern = /<a[^>]*>(<img[^>]*>)<\/a>/gi
  return content.replace(pattern, '$1')
}

/**
 * Converts HTML content to Markdown.
 *
 * @param {string} content - The HTML content to convert.
 * @returns {string} The converted Markdown content.
 */
function convertHtmlToMarkdown(content) {
  content = removeATagsWithImages(content)
  return turndownService.turndown(/* html */`
    <html>
      <body>
        ${content}
      </body>
    </html>  
  `)
}

/**
 * Transforms annotation tags in the content.
 *
 * @param {string} content - The content to transform.
 * @returns {string} The transformed content with annotation tags.
 */
function transformAnnotations(content) {
  const annotationPattern = /\\\[annotation id="(\d+)"\\\]\s?(.*?)\\\[\/annotation\\\]/gs
  return content.replace(annotationPattern, ':annotation{:ids="[$1]"}[$2]')
}

/**
 * Transforms donate tags in the content.
 *
 * @param {string} content - The content to transform.
 * @returns {string} The transformed content with donate tags.
 */
function transformDonate(content) {
  const annotationPattern = /\\\[donate\\\]\s?(.*?)\\\[\/donate\\\]/gs
  return content.replace(annotationPattern, ':donate[$1]')
}

/**
 * Transforms video tags in the content.
 *
 * @param {string} content - The content to transform.
 * @returns {string} The transformed content with video tags.
 */
function transformVideos(content) {
  const pattern = /\\\[(content-video|video) (url|id)="(.*?)"\\\]/g

  return content.replace(pattern, (_match, _p1, _p2, p3) => `\n\n::external-video{url="${(p3 ?? '').trim()}"}\n::\n\n`)
}

/**
 * Converts content to Markdown and applies various transformations.
 *
 * @param {string} [content] - The content to convert and transform.
 * @param {object} [metaData] - The metadata to add to the content.
 * @returns {string} The converted and transformed content.
 */
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
