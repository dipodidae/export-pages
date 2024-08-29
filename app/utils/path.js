import path from 'node:path'

function convertTitleToSlug(page) {
  return page.post_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}
export function getSlug(page) {
  let slug = page.post_title.replace(/[^a-z0-9]/gi, '-').toLowerCase()

  slug = slug.replace(/-+/g, '-')
  slug = slug.replace(/^-|-$/g, '')

  return slug
}

export function getPagePath(pages, page) {
  const parent = pages.find(page => page.ID === page.post_parent)

  if (parent) {
    return path.join(getPagePath(pages, parent), convertTitleToSlug(page))
  }

  return convertTitleToSlug(page)
}
