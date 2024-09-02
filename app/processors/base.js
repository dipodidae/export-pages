import he from 'he'
import { getSlug } from '../utils/path.js'
import { save as saveFileWithContent } from '../utils/files.js'

export default class BaseProcessor {
  constructor(posts, post) {
    this.posts = posts
    this.post = post
  }

  getSlug(string) {
    return getSlug(string)
  }

  async save() {
    return saveFileWithContent(
      this.getFileName(),
      he.decode(this.post.post_content),
    )
  }
}
