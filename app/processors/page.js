import he from 'he'
import phpSerialize from 'php-serialize'
import AnnotationProcessor from './annotation.js'
import PostProcessor from './post.js'

export default class extends PostProcessor {
  getPostOrder() {
    return this.addIndexIfNecessary(this.getPostHierarchy())
  }

  getPostHierarchy() {
    const postsInOrder = [this.post]

    let postId = this.post.post_parent

    while (postId) {
      const parentPost = this.posts.find(post => post.ID === postId)

      if (!parentPost)
        break

      postsInOrder.unshift(parentPost)

      postId = parentPost.post_parent
    }

    return postsInOrder
  }

  hasChildren() {
    return this.posts.some(post => post.post_parent === this.post.ID)
  }

  getParent() {
    return this.posts.find(post => post.ID === this.post.post_parent)
  }

  addIndexIfNecessary(postsInOrder) {
    const hasChildren = this.hasChildren()

    if (hasChildren || (postsInOrder.length === 2 && !hasChildren))
      postsInOrder.push({ post_title: 'index' })

    return postsInOrder
  }

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
    if (!this.post.parent)
      return false

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
    if (!attachments)
      return []

    const parsedAttachments = JSON.parse(attachments)

    return parsedAttachments.annotations || []
  }

  /**
   * Saves annotations based on the provided metadata.
   */
  saveAnnotations() {
    this.getAnnotations(this.post.metaData.attachments)
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

  getDescription() {
    if (this.post.metaData['ongehoord-intro'])
      return he.decode(this.post.metaData['ongehoord-intro']).replace('\r\n', ' ')

    if (this.post.post_parent && this.post.post_parent !== 0) {
      const parent = this.posts.find(post => post.ID === this.post.post_parent)

      return `${parent.post_title} - ${this.post.post_title}`
    }

    return ''
  }

  /**
   * Transforms the provided metadata into a structured format.
   *
   * @returns {object} The transformed metadata.
   */
  parseMetaData() {
    const metaData = {
      title: this.post.post_title,
      description: this.getDescription(),
    }

    if (this.post.metaData['ongehoord-article-categories'])
      metaData.categories = this.getCategories(this.post.metaData['ongehoord-article-categories'])

    if (this.post.metaData['ongehoord-video'])
      metaData.video = this.post.metaData['ongehoord-video']

    if (this.post.metaData['ongehoord-year'])
      metaData.year = this.post.metaData['ongehoord-year']

    if (this.post.thumbnail_url) {
      metaData.image = {
        src: (this.post.thumbnail_url ?? '').trim(),
        alt: this.post.post_title,
      }
    }

    return metaData
  }
}
