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
    const postsInOrder = this.getPostsInOrder(this.post, this.posts)
    return this.addIndexIfNecessary(postsInOrder, this.post, this.posts)
  }

  /**
   * Retrieves the posts in order from the current post to the root parent.
   *
   * @param {object} post - The current post object.
   * @param {Array<object>} posts - The array of all posts.
   * @returns {Array<object>} An array of posts in order from the current post to the root parent.
   */
  getPostsInOrder(post, posts) {
    const postsInOrder = [post]

    let postId = post.post_parent

    while (postId) {
      const parentPost = posts.find(p => p.ID === postId)

      if (!parentPost) {
        break
      }

      postsInOrder.unshift(parentPost)

      postId = parentPost.post_parent
    }

    return postsInOrder
  }

  /**
   * Adds an index post if the current post has children.
   *
   * @param {Array<object>} postsInOrder - The array of posts in order.
   * @param {object} post - The current post object.
   * @param {Array<object>} posts - The array of all posts.
   * @returns {Array<object>} The updated array of posts with the index post added if necessary.
   */
  addIndexIfNecessary(postsInOrder, post, posts) {
    const hasChildren = postId => posts.some(p => p.post_parent === postId)

    if (hasChildren(post.ID)) {
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

  /**
   * Transforms the provided metadata into a structured format.
   *
   * @returns {object} The transformed metadata.
   */
  parseMetaData() {
    const transformedMetaData = {
      title: this.post.post_title,
    }

    if (this.post.metaData['ongehoord-intro'])
      transformedMetaData.intro = this.post.metaData['ongehoord-intro']

    if (this.post.metaData['ongehoord-article-categories'])
      transformedMetaData.categories = this.getCategories(this.post.metaData['ongehoord-article-categories'])

    if (this.post.metaData['ongehoord-video'])
      transformedMetaData.video = this.post.metaData['ongehoord-video']

    if (this.post.metaData['ongehoord-year'])
      transformedMetaData.year = this.post.metaData['ongehoord-year']

    if (this.post.thumbnail_url)
      transformedMetaData.image = this.post.thumbnail

    return transformedMetaData
  }
}
