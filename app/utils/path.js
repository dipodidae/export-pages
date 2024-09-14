import path from 'node:path'
import slug from 'slug'
/**
 * Converts a page title to a slug by replacing non-alphanumeric characters with underscores and converting to lowercase.
 *
 * @param {object} page - The page object containing the title.
 * @param {string} page.post_title - The title of the page.
 * @returns {string} The slugified title.
 */
function convertTitleToSlug(page) {
  return page.post_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

/**
 * Converts a string to a slug by replacing non-alphanumeric characters with hyphens, converting to lowercase, and removing leading/trailing hyphens.
 *
 * @param {string} [string] - The string to be slugified.
 * @returns {string} The slugified string.
 */
export function getSlug(string = '') {
  return slug(string, { lower: true })
}

/**
 * Constructs the path for a given page based on its hierarchy.
 *
 * @param {Array<object>} pages - An array of page objects.
 * @param {object} page - The current page object.
 * @param {number} page.ID - The ID of the current page.
 * @param {number} page.post_parent - The ID of the parent page.
 * @returns {string} The constructed path for the current page.
 */
export function getPagePath(pages, page) {
  const parent = pages.find(p => p.ID === page.post_parent)

  if (parent) {
    return path.join(getPagePath(pages, parent), convertTitleToSlug(page))
  }

  return convertTitleToSlug(page)
}
