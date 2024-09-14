import LocationProcessor from './processors/location.js'
import PageProcessor from './processors/page.js'
import getLocations from './queries/locations.js'
import getPages from './queries/pages.js'

/**
 * Exports items using the provided processor factory.
 *
 * @param {Array<object>} items - The items to be processed and exported.
 * @param {function(object, Array<object>): object} processorFactory - A factory function that creates a processor for each item.
 * @returns {Promise<void>} A promise that resolves when all items have been processed and saved.
 */
async function exportItems(items, processorFactory) {
  const processors = items.map(item => processorFactory(items, item))

  const savePromises = processors.map(processor => processor.save())

  await Promise.all(savePromises)
}

/**
 * Exports pages using the PageProcessor.
 *
 * @param {Array<object>} pages - The pages to be processed and exported.
 * @returns {Promise<void>} A promise that resolves when all pages have been processed and saved.
 */
async function exportPages(pages) {
  return exportItems(pages, (items, item) => {
    const processor = new PageProcessor(items, item)

    processor.saveAnnotations()

    return processor
  })
}

/**
 * Exports locations using the LocationProcessor.
 *
 * @param {Array<object>} pages - The pages to be used by the LocationProcessor.
 * @returns {Promise<void>} A promise that resolves when all locations have been processed and saved.
 */
async function exportLocations(pages) {
  const locations = await getLocations()

  return exportItems(locations, (items, item) => {
    const processor = new LocationProcessor(items, item)

    processor.setPages(pages)

    return processor
  })
}

/**
 * Main export function that exports both pages and locations.
 *
 * @returns {Promise<void>} A promise that resolves when all pages and locations have been processed and saved.
 */
export default async function () {
  const pages = await getPages()

  await exportPages(pages)
  await exportLocations(pages)
}
