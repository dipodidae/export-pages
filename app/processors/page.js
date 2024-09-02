import phpSerialize from 'php-serialize'
import AnnotationProcessor from './annotation.js'
import PostProcessor from './post.js'

export default class extends PostProcessor {
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

  getPath() {
    return this.getPostOrder()
      .map(pageInOrder => this.getSlug(pageInOrder.post_title))
      .join('/')
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

  getCategories(serializedCategories) {
    const categories = phpSerialize.unserialize(serializedCategories)
    return Object.entries(categories).map(([_key, value]) => value)
  }

  getAnnotations(attachments = '') {
    if (!attachments) {
      return []
    }

    const parsedAttachments = JSON.parse(attachments)

    return parsedAttachments.annotations || []
  }

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

  transformMetaData(metaData) {
    const transformedMetaData = {}

    this.saveAnnotations(metaData)

    if (metaData['ongehoord-intro']) {
      transformedMetaData.intro = metaData['ongehoord-intro']
    }

    if (metaData['ongehoord-article-categories']) {
      transformedMetaData.categories = this.getCategories(metaData['ongehoord-article-categories'])
    }

    if (metaData['ongehoord-video']) {
      transformedMetaData.video = metaData['ongehoord-video']
    }

    if (metaData['ongehoord-year']) {
      transformedMetaData.year = metaData['ongehoord-year']
    }

    return transformedMetaData
  }
}
