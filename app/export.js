import getPages from './queries/pages.js'
import { convert } from './utils/markdown.js'
import { save } from './utils/files.js'

function convertTitleToSlug(page) {
  let slug = page.post_title.replace(/[^a-z0-9]/gi, '-').toLowerCase()

  slug = slug.replace(/-+/g, '-')
  slug = slug.replace(/^-|-$/g, '')

  return slug
}

function getPath(pages, page) {
  const path = [page]
  let parentId = page.post_parent

  while (parentId) {
    const parentPage = pages.find(page => page.ID === parentId)

    if (!parentPage) {
      break
    }

    path.unshift(parentPage)
    parentId = parentPage.post_parent
  }

  if (path.at(0).post_title === 'Onderzoek' && path.length === 1) {
    path.push({
      post_title: 'index',
    })
  }

  if (path.at(0).post_title === 'Onderzoek' && path.length === 2) {
    path.push({
      post_title: 'index',
    })
  }

  return path.map(convertTitleToSlug).join('/')
}

function savePage(page, pages) {
  const path = getPath(pages, page)

  const fileName = `${path}.md`

  return save(
    fileName,
    convert(
      page.post_content,
      {
        id: page.ID,
        title: page.post_title,
        parent: page.post_parent,
        type: 'page',
      },
    ),
  )
}

export default async function () {
  const pages = await getPages()

  pages.forEach(page => savePage(page, pages))
}
