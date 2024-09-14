import phpSerialize from 'php-serialize'
import AnnotationProcessor from './annotation.js'
import PostProcessor from './post.js'

export default class extends PostProcessor {
  /**
   * Retrieves the order of posts starting from the current post up to the root parent.
   *
   * @returns {Array<object>} An array of posts in order from the current post to the root parent.
   */
  getPostOrder() {
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

    if (hasChildren(this.post.ID)) {
      postsInOrder.push({
        post_title: 'index',
      })
    }

    return postsInOrder
  }

  /**
   * Constructs the path for the current post based on its order.
   *
   * @returns {string} The constructed path for the current post.
   */
  getPath() {
    return this.getPostOrder()
      .map(pageInOrder => this.getSlug(pageInOrder.post_title))
      .join('/')
  }

  /**
   * Checks if the current post has a parent with a specific title.
   *
   * @param {string} [title] - The title to check against.
   * @returns {boolean} True if a parent with the specified title exists, false otherwise.
   */
  hasParentWithTitle(title = '') {
    if (!this.post.parent) {
      return false
    }

    const parent = this.posts.find(possibleParent => possibleParent.ID === this.post.parent)

    return parent.post_title === title || this.hasParentWithTitle(parent, title)
  }

  /**
   * Constructs the filename for the current post based on its path.
   *
   * @returns {string} The constructed filename for the current post.
   */
  getFileName() {
    return `${this.getPath()}.md`
  }

  /**
   * Unserializes and retrieves the categories from a serialized string.
   *
   * @param {string} serializedCategories - The serialized categories string.
   * @returns {Array<string>} An array of category names.
   */
  getCategories(serializedCategories) {
    const categories = phpSerialize.unserialize(serializedCategories)
    return Object.entries(categories).map(([_key, value]) => value)
  }

  /**
   * Parses and retrieves annotations from a JSON string.
   *
   * @param {string} [attachments] - The JSON string containing attachments.
   * @returns {Array<object>} An array of annotation objects.
   */
  getAnnotations(attachments = '') {
    if (!attachments) {
      return []
    }

    const parsedAttachments = JSON.parse(attachments)

    return parsedAttachments.annotations || []
  }

  /**
   * Saves annotations based on the provided metadata.
   *
   * @param {object} [metaData] - The metadata containing attachments.
   */
  saveAnnotations(metaData = {}) {
    this.getAnnotations(metaData.attachments)
      .map(({ fields }) => {
        const processor = new AnnotationProcessor(this.posts, {
          id: fields.id,
          post_content: fields.content,
        })

        processor.setPostOrder(this.getPostOrder())

        return processor
      })
      .forEach(processor => processor.save())
  }

  /**
   * Transforms the provided metadata into a structured format.
   *
   * @param {object} metaData - The metadata to transform.
   * @returns {object} The transformed metadata.
   */
  transformMetaData(metaData) {
    const transformedMetaData = {}

    this.saveAnnotations(metaData)

    if (metaData['ongehoord-intro'])
      transformedMetaData.intro = metaData['ongehoord-intro']

    if (metaData['ongehoord-article-categories'])
      transformedMetaData.categories = this.getCategories(metaData['ongehoord-article-categories'])

    if (metaData['ongehoord-video'])
      transformedMetaData.video = metaData['ongehoord-video']

    if (metaData['ongehoord-year'])
      transformedMetaData.year = metaData['ongehoord-year']

    if (this.post.thumbnail_url)
      transformedMetaData.image = this.post.thumbnail

    return transformedMetaData
  }
}
