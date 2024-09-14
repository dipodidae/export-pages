import { paths } from '../constants/index.js'
import BaseProcessor from './base.js'

/**
 * Class representing an AnnotationProcessor.
 * Extends the BaseProcessor class to handle annotation-specific processing.
 */
export default class AnnotationProcessor extends BaseProcessor {
  /**
   * The order of posts from the current post to the root parent.
   * @type {Array<object>}
   */
  postOrder = null

  /**
   * Constructs the filename for the current post based on its order and paths.
   *
   * @returns {string} The constructed filename for the current post.
   */
  getFileName() {
    const postOrder = this.postOrder.length === 2 ? this.postOrder : this.postOrder.slice(0, -1)
    const articlePath = postOrder.map(post => this.getSlug(post.post_title)).join('/')
    return `${articlePath}/${paths.sources}/${this.post.id}.md`
  }

  /**
   * Sets the order of posts from the current post to the root parent.
   *
   * @param {Array<object>} posts - An array of posts in order from the current post to the root parent.
   */
  setPostOrder(posts) {
    this.postOrder = posts
  }
}
