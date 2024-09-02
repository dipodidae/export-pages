import getMetaData from '../queries/meta-data.js'
import { convert } from '../utils/markdown.js'
import BaseProcessor from './base.js'

export default class extends BaseProcessor {
  async getMetaData() {
    const metaData = await getMetaData(this.post.ID)

    return metaData
  }

  getFileName() {
    return `${this.getSlug(this.post.post_title)}.md`
  }

  transformMetaData(metaData) {
    return Object.entries(metaData).reduce((acc, [key, value]) => {
      if (!key.startsWith('_')) {
        acc[key] = value
      }

      return acc
    })
  }

  async parseMetaData() {
    const metaData = this.transformMetaData(await this.getMetaData())

    return {
      title: this.post.post_title,
      ...metaData,
    }
  }

  async getContent() {
    return convert(
      this.post.post_content,
      await this.parseMetaData(),
    )
  }
}
