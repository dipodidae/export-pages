import phpSerialize from 'php-serialize'
import { paths } from '../constants/index.js'
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
    const page = this.getPageById(this.post.metaData.location_article)

    const pageProcessor = new PageProcessor(this.pages, page)

    const pagesInOrder = pageProcessor.getPostHierarchy()

    const path = pagesInOrder.map(pageInOrder => pageProcessor.getSlug(pageInOrder.post_title)).join('/')

    console.log('path for location', path)

    return `${path}/${paths.locations}/${this.getSlug(this.post.post_title)}.md`
  }

  /**
   * Parses an address string into its components: street, postal code, city, and country.
   *
   * @param {string} address - The address string to parse.
   * @returns {object} An object containing the parsed address components.
   */
  parseAddress(address) {
    const result = {
      street: null,
      postalCode: null,
      city: null,
      country: null,
    }

    if (!address) {
      return result
    }

    // Split the address by commas
    const parts = address.split(',').map(part => part.trim())

    // Assume the last part is the country
    if (parts.length > 0) {
      result.country = parts.pop()
    }

    // Assume the second last part is the city
    if (parts.length > 0) {
      const cityPart = parts.pop()
      const postalCodeMatch = cityPart.match(/\b\d{4}\s?[A-Z]{2}\b/)

      if (postalCodeMatch) {
        result.postalCode = postalCodeMatch[0]
        result.city = cityPart.replace(postalCodeMatch[0], '').trim()
      }
      else {
        result.city = cityPart
      }
    }

    // Assume the remaining part contains the street and postal code
    if (parts.length > 0) {
      const streetAndPostalCode = parts.join(', ')
      const postalCodeMatch = streetAndPostalCode.match(/\b\d{4}\s?[A-Z]{2}\b/)

      if (postalCodeMatch) {
        result.postalCode = postalCodeMatch[0]
        result.street = streetAndPostalCode.replace(postalCodeMatch[0], '').trim()
      }
      else {
        result.street = streetAndPostalCode
      }
    }

    return result
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
      address: this.parseAddress(this.post.metaData['ongehoord-location-address']),
      video: this.post.metaData['ongehoord-video'],
      categories: this.getCategories(this.post.metaData['ongehoord-article-categories']),
      welfareBrand: this.post.metaData['ongehoord-location-quality-brand'],
      owner: this.post.metaData['ongehoord-location-company-owner'],
      organization: this.post.metaData['ongehoord-location-organization'],
      stableSystem: this.post.metaData['ongehoord-location-stable-system'],
      companyName: this.post.metaData['ongehoord-location-company-name'],
      title: this.post.title,
    }
  }
}
