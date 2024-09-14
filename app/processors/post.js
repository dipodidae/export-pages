import { convert } from '../utils/markdown.js'
import BaseProcessor from './base.js'

/**
 * Class representing a PostProcessor.
 * Extends the BaseProcessor class to handle post-specific processing.
 */
export default class PostProcessor extends BaseProcessor {
  /**
   * Constructs the filename for the current post based on its title.
   *
   * @returns {string} The constructed filename for the current post.
   */
  getFileName() {
    return `${this.getSlug(this.post.post_title)}.md`
  }

  /**
   * Parses and returns the metadata for the current post.
   *
   * @returns {object} An object containing the parsed metadata.
   */
  parseMetaData() {
    return {
      title: this.post.post_title,
    }
  }

  /**
   * Converts the post content to markdown format using the parsed metadata.
   *
   * @returns {Promise<string>} A promise that resolves to the converted content.
   */
  async getContent() {
    return convert(
      this.post.post_content,
      this.parseMetaData(),
    )
  }
}
