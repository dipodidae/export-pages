import getPages from './queries/pages.js'
import getLocations from './queries/locations.js'
import PageProcessor from './processors/page.js'
import LocationProcessor from './processors/location.js'

async function exportItems(query, Processor) {
  const items = await query()
  const processors = items.map(item => new Processor(items, item))

  const savePromises = processors.map(processor => processor.save())

  await Promise.all(savePromises)
}

function exportPages() {
  return exportItems(getPages, PageProcessor)
}

function exportLocations() {
  return exportItems(getLocations, LocationProcessor)
}

export default async function () {
  await exportPages()
  await exportLocations()
}
