import getPosts from './posts.js'

/**
 * Retrieves posts of type 'page'.
 *
 * @returns {Promise<Array<object>>} A promise that resolves to an array of page objects.
 */
export default function getPages() {
  return getPosts('page')
}
