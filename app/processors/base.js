import decode from '../utils/decode.js'
import { save as saveFileWithContent } from '../utils/files.js'
import { getSlug } from '../utils/path.js'

/**
 * Class representing a BaseProcessor.
 * Handles basic processing tasks for posts.
 */
export default class BaseProcessor {
  /**
   * An array of posts.
   * @type {Array<object>}
   */
  posts = []

  /**
   * The current post object.
   * @type {object}
   */
  post = {}

  /**
   * Creates an instance of BaseProcessor.
   *
   * @param {Array<object>} posts - An array of post objects.
   * @param {object} post - The current post object.
   */
  constructor(posts, post) {
    this.posts = posts
    this.post = post
  }

  /**
   * Converts a string to a slug.
   *
   * @param {string} string - The string to be slugified.
   * @returns {string} The slugified string.
   */
  getSlug(string) {
    return getSlug(string)
  }

  /**
   * Decodes the post content and cleans it.
   *
   * @returns {string} The decoded and cleaned content.
   */
  getContent() {
    return decode(this.post.post_content).replace(/\n/, '\n')
  }

  /**
   * Saves the post content to a file.
   *
   * @returns {Promise<void>} A promise that resolves when the content is saved.
   */
  async save() {
    const content = await this.getContent()

    return saveFileWithContent(
      this.getFileName(),
      content,
    )
  }
}
