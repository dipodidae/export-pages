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
   * Retrieves a page object by its slug.
   *
   * @param {string} slug - The slug of the page to retrieve.
   * @returns {object|undefined} The page object if found, otherwise undefined.
   */
  getPageBySlug(slug) {
    return this.pages.find(page => page.post_name === slug)
  }

  /**
   * Retrieves a page object by its ID.
   *
   * @param {number} id - The ID of the page to retrieve.
   * @returns {object|undefined} The page object if found, otherwise undefined.
   */
  getPageById(id) {
    return this.pages.find(page => page.id === id)
  }

  /**
   * Generates the file name for the current post based on its title and the order of related pages.
   *
   * @returns {string} The constructed file name for the current post.
   */
  getFileName() {
    const page = this.getPageBySlug(this.post.metaData['ongehoord-location-article'])
      ?? this.getPageById(this.post.metaData.location_article)

    if (!page)
      throw new Error('Page related to location not found.')

    const pageProcessor = new PageProcessor(this.pages, page)

    const pagesInOrder = pageProcessor.getPostHierarchy()

    const path = pagesInOrder.map(pageInOrder => pageProcessor.getSlug(pageInOrder.post_title)).join('/')

    return `${path}/${paths.locations}/${this.getSlug(this.post.post_title)}.md`
  }

  /**
   * Parses an address string into its components: street, postal code, city, and country.
   *
   * @param {string} address - The address string to parse.
   * @returns {object} An object containing the parsed address components.
   */
  parseAddress(address) {
    // Default result object with null values
    const result = {
      street: null,
      postalCode: null,
      city: null,
      country: null,
    }

    // Return default if no address provided
    if (!address) {
      return result
    }

    // Normalize the address by trimming and removing extra spaces
    const normalizedAddress = address.trim().replace(/\s+/g, ' ')

    // Postal code regex for various formats (e.g., 1234 AB, 12345)
    const postalCodeRegex = /\b\d{4}\s?[A-Z]{2}\b|\b\d{5}\b/

    // Try to split the address into parts
    const parts = normalizedAddress.split(',').map(part => part.trim())

    // Attempt to identify country (last part)
    if (parts.length > 0) {
      result.country = parts[parts.length - 1]
    }

    // If only one part, try to parse it comprehensively
    if (parts.length === 1) {
      const comprehensiveParse = this.parseComprehensiveAddress(normalizedAddress)
      return { ...result, ...comprehensiveParse }
    }

    // Remove country from parts
    parts.pop()

    // Attempt to identify postal code and city
    let cityFound = false
    for (let i = parts.length - 1; i >= 0; i--) {
      const postalCodeMatch = parts[i].match(postalCodeRegex)

      if (postalCodeMatch) {
        result.postalCode = postalCodeMatch[0]

        // If city hasn't been found yet
        if (!cityFound) {
          result.city = parts[i].replace(postalCodeMatch[0], '').trim()
          cityFound = true
        }

        // Remove the postal code part
        parts[i] = parts[i].replace(postalCodeMatch[0], '').trim()
      }
    }

    // Set city if not already set
    if (!result.city && parts.length > 0) {
      result.city = parts[parts.length - 1]
    }

    // Remaining parts become the street
    if (parts.length > 0) {
      // Remove potential city from parts
      if (result.city) {
        const cityIndex = parts.lastIndexOf(result.city)
        if (cityIndex !== -1) {
          parts.splice(cityIndex, 1)
        }
      }

      // Join remaining parts as street
      result.street = parts.join(', ').trim()
    }

    return result
  }

  // Helper function for more comprehensive parsing when address is a single string
  parseComprehensiveAddress(address) {
    const result = {
      street: null,
      postalCode: null,
      city: null,
    }

    // Postal code regex for various formats (e.g., 1234 AB, 12345)
    const postalCodeRegex = /\b\d{4}\s?[A-Z]{2}\b|\b\d{5}\b/

    // Try to find postal code first
    const postalCodeMatch = address.match(postalCodeRegex)
    if (postalCodeMatch) {
      result.postalCode = postalCodeMatch[0]

      // Split address around postal code
      const parts = address.split(postalCodeMatch[0]).map(part => part.trim())

      // One part before, one part after postal code
      if (parts.length === 2) {
        // Determine which part is street and which is city
        const streetPart = parts[0]
        const cityPart = parts[1]

        result.street = streetPart
        result.city = cityPart
      }
    }
    else {
      // If no postal code, make a best guess
      const parts = address.split(/\s+/)

      // Assume the last part might be the city
      result.city = parts[parts.length - 1]

      // Street is everything before the city
      result.street = parts.slice(0, -1).join(' ')
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
      title: this.post.post_title,
    }
  }
}
