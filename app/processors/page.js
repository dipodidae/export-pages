import phpSerialize from 'php-serialize'
import BaseProcessor from './base.js'

export default class extends BaseProcessor {
  getCategories(serializedCategories) {
    const categories = phpSerialize.unserialize(serializedCategories)
    return Object.entries(categories).map(([_key, value]) => value)
  }

  parseAnnotations(attachments = '') {
    let parsedAttachments = {}

    try {
      parsedAttachments = JSON.parse(attachments)
    }
    catch {
      console.error('Error parsing annotations', attachments)
    }

    return (parsedAttachments.annotations ?? []).map((annotation) => {
      return {
        content: annotation.content,
        id: annotation.id,
      }
    })
  }

  transformMetaData(metaData) {
    const transformedMetaData = {}

    if (metaData['ongehoord-intro']) {
      transformedMetaData.intro = metaData['ongehoord-intro']
    }

    const annotations = this.parseAnnotations(metaData.attachments)

    if (annotations.length) {
      transformedMetaData.attachments = annotations
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

  getFileName() {
    return `locaties/${this.getPath()}.md`
  }
}
