import he from 'he'

/**
 * Cleans the content by trimming each line and removing specific unwanted characters.
 *
 * @param {string} content - The content to be cleaned.
 * @returns {string} The cleaned content.
 */
function cleanContent(content) {
  content = content.split('\n').map(line => line.trim()).join('\n')
  content = content.replace(/[\v\f\u00A0\u0085\u1680\u180E\uFEFF\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]/g, '')

  return content
}

/**
 * Decodes HTML entities in the content and cleans it.
 *
 * @param {string} [content] - The content to be decoded and cleaned.
 * @returns {string} The decoded and cleaned content.
 */
export default function decodeAndCleanContent(content = '') {
  content = he.decode(content)
  content = cleanContent(content)

  return content
}
