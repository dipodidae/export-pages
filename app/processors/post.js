import getMetaData from '../queries/meta-data.js'
import { convert } from '../utils/markdown.js'
import BaseProcessor from './base.js'

/**
 * Class representing a PostProcessor.
 * Extends the BaseProcessor class to handle post-specific processing.
 */
export default class PostProcessor extends BaseProcessor {
  /**
   * Retrieves metadata for the current post.
   *
   * @returns {Promise<object>} A promise that resolves to the metadata object.
   */
  async getMetaData() {
    this.metaData = await getMetaData(this.post.ID)
  }

  /**
   * Constructs the filename for the current post based on its title.
   *
   * @returns {string} The constructed filename for the current post.
   */
  getFileName() {
    return `${this.getSlug(this.post.post_title)}.md`
  }

  /**
   * Transforms the provided metadata by removing keys that start with an underscore.
   *
   * @returns {object} The transformed metadata.
   */
  transformMetaData() {
    return Object.entries(this.metaData).reduce((acc, [key, value]) => {
      if (!key.startsWith('_')) {
        acc[key] = value
      }
      return acc
    }, {})
  }

  /**
   * Parses and transforms the metadata for the current post.
   *
   * @returns {Promise<object>} A promise that resolves to the parsed metadata object.
   */
  parseMetaData() {
    return {
      title: this.post.post_title,
      ...this.transformMetaData(),
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
