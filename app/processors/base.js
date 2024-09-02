import { getSlug } from '../utils/path.js'
import { save as saveFileWithContent } from '../utils/files.js'
import decode from '../utils/decode.js'

export default class BaseProcessor {
  constructor(posts, post) {
    this.posts = posts
    this.post = post
  }

  getSlug(string) {
    return getSlug(string)
  }

  getContent() {
    return decode(this.post.post_content).replace(/\n/, '\n')
  }

  async save() {
    const content = await this.getContent()

    return saveFileWithContent(
      this.getFileName(),
      content,
    )
  }
}
