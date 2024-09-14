import phpSerialize from 'php-serialize'
import PageProcessor from './page.js'
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
   * Generates the file name for the current post based on its title and the order of related pages.
   *
   * @returns {string} The constructed file name for the current post.
   */
  getFileName() {
    const pageProcessor = new PageProcessor(this.pages, this.getPageById(this.post.metaData['ongehoord-location-article']))

    const pagesInOrder = pageProcessor.getPostsInOrder()

    const path = pagesInOrder.map(pageInOrder => pageProcessor.getSlug(pageInOrder.post_title)).join('/')

    return `${path}/${path.locations}/${this.getSlug(this.post.post_title)}.md`
  }

  /**
   * Transforms the provided metadata into a structured format.
   *
   * @returns {object} The transformed metadata.
   */
  parseMetaData() {
    return {
      position: {
        lat: Number.parseFloat(this.post.metaData['ongehoord-location-location-lat']),
        lng: Number.parseFloat(this.post.metaData['ongehoord-location-location-lon']),
      },
      address: this.post.metaData['ongehoord-location-address'],
      article: this.post.metaData['ongehoord-location-article'],
      video: this.post.metaData['ongehoord-video'],
      categories: this.getCategories(this.post.metaData['ongehoord-article-categories']),
      qualityBrand: this.post.metaData['ongehoord-location-quality-brand'],
      owner: this.post.metaData['ongehoord-location-company-owner'],
      organization: this.post.metaData['ongehoord-location-organization'],
      stableSystem: this.post.metaData['ongehoord-location-stable-system'],
      companyName: this.post.metaData['ongehoord-location-company-name'],
      title: this.post.title,
    }
  }
}
