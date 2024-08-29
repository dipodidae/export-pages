import phpSerialize from 'php-serialize'
import BaseProcessor from './base.js'

export default class extends BaseProcessor {
  getCategories(serializedCategories) {
    if (!serializedCategories) {
      return []
    }

    const categories = phpSerialize.unserialize(serializedCategories)
    return Object.entries(categories).map(([_key, value]) => value)
  }

  transformMetaData(metaData) {
    return {
      location: {
        lat: Number.parseFloat(metaData['ongehoord-location-location-lat']),
        lng: Number.parseFloat(metaData['ongehoord-location-location-lon']),
      },
      address: metaData['ongehoord-location-address'],
      article: metaData['ongehoord-location-article'],
      video: metaData['ongehoord-video'],
      categories: this.getCategories(metaData['ongehoord-article-categories']),
      qualityBrtand: metaData['ongehoord-location-quality-brand'],
      owner: metaData['ongehoord-location-company-owner'],
      organization: metaData['ongehoord-location-organization'],
      stableSystem: metaData['ongehoord-location-stable-system'],
      companyName: metaData['ongehoord-location-company-name'],
      title: metaData.title,
    }
  }
}
