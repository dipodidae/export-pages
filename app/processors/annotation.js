import BaseProcessor from './base.js'

export default class extends BaseProcessor {
  postOrder = null

  getFileName() {
    const postOrder = this.postOrder.length === 2 ? this.postOrder : this.postOrder.slice(0, -1)

    const basePath = postOrder.map(post => this.getSlug(post.post_title)).join('/')

    return `${basePath}/annotations/${this.post.id}.md`
  }

  setPostOrder(posts) {
    this.postOrder = posts
  }
}
