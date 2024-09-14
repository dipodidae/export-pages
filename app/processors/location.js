import phpSerialize from 'php-serialize'
import { paths } from '../constants/index.js'
import PostProcessor from './post.js'

/**
 * Class representing a LocationProcessor.
 * Extends the PostProcessor class to handle location-specific processing.
 */
export default class LocationProcessor extends PostProcessor {
  /**
   * An array of page objects.
   * @type {Array<object>}
   */
  pages = []

  /**
   * Retrieves categories from a serialized string.
   *
   * @param {string} serializedCategories - The serialized categories string.
   * @returns {Array<string>} An array of category names.
   */
  getCategories(serializedCategories) {
    if (!serializedCategories) {
      return []
    }

    const categories = phpSerialize.unserialize(serializedCategories)
    return Object.entries(categories).map(([_key, value]) => value)
  }

  /**
   * Constructs the filename for the current post based on its title.
   *
   * @returns {string} The constructed filename for the current post.
   */
  getFileName() {
    const page = this.getPageById(this.metaData.location_article)
    return `${paths.locations}/${this.getSlug(this.post.post_title)}.md`
  }

  /**
   * Sets the pages array.
   *
   * @param {Array<object>} pages - An array of page objects.
   */
  setPages(pages) {
    this.pages = pages
  }

  /**
   * Retrieves a page by its ID.
   *
   * @param {number|string} id - The ID of the page to retrieve.
   * @returns {object|undefined} The page object if found, otherwise undefined.
   */
  getPageById(id) {
    return this.pages.find(page => Number.parseInt(page.ID) === Number.parseInt(id))
  }

  /**
   * Transforms the provided metadata into a structured format.
   *
   * @param {object} metaData - The metadata to transform.
   * @returns {object} The transformed metadata.
   */
  transformMetaData(metaData) {
    return {
      position: {
        lat: Number.parseFloat(metaData['ongehoord-location-location-lat']),
        lng: Number.parseFloat(metaData['ongehoord-location-location-lon']),
      },
      address: metaData['ongehoord-location-address'],
      article: metaData['ongehoord-location-article'],
      video: metaData['ongehoord-video'],
      categories: this.getCategories(metaData['ongehoord-article-categories']),
      qualityBrand: metaData['ongehoord-location-quality-brand'],
      owner: metaData['ongehoord-location-company-owner'],
      organization: metaData['ongehoord-location-organization'],
      stableSystem: metaData['ongehoord-location-stable-system'],
      companyName: metaData['ongehoord-location-company-name'],
      title: metaData.title,
    }
  }
}
