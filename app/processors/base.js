import { convert } from '../utils/markdown.js'
import { getSlug } from '../utils/path.js'
import { save as saveFileWithContent } from '../utils/files.js'
import getMetaData from '../queries/meta-data.js'

export default class BaseProcessor {
  constructor(posts, post) {
    this.posts = posts
    this.post = post
  }

  async getMetaData() {
    const metaData = await getMetaData(this.post.ID)

    return metaData
  }

  transformMetaData(metaData) {
    return Object.entries(metaData).reduce((acc, [key, value]) => {
      if (!key.startsWith('_')) {
        acc[key] = value
      }

      return acc
    })
  }

  async parseMetaData() {
    const metaData = this.transformMetaData(await this.getMetaData())

    return {
      title: this.post.post_title,
      ...metaData,
    }
  }

  getPath() {
    const postsInOrder = [this.post]

    let postId = this.post.post_parent

    while (postId) {
      const parentPost = this.posts.find(p => p.ID === postId)

      if (!parentPost) {
        break
      }

      postsInOrder.unshift(parentPost)

      postId = parentPost.post_parent
    }

    const hasChildren = postId => this.posts.some(p => p.post_parent === postId)

    if (hasChildren(postsInOrder.at(0).ID)) {
      postsInOrder.push({
        post_title: 'index',
      })
    }

    return postsInOrder.map(pageInOrder => getSlug(pageInOrder)).join('/')
  }

  hasParentWithTitle(title = '') {
    if (!this.post.parent) {
      return false
    }

    const parent = this.posts.find(possibleParent => possibleParent.ID === this.post.parent)

    return parent.post_title === title || this.hasParentWithTitle(parent, title)
  }

  getFileName() {
    return `${this.getPath()}.md`
  }

  async save() {
    return saveFileWithContent(
      this.getFileName(),
      convert(
        this.post.post_content,
        await this.parseMetaData(),
      ),
    )
  }
}
