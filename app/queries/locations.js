import getPosts from './posts.js'

/**
 * Retrieves posts of type 'location'.
 *
 * @returns {Promise<Array<object>>} A promise that resolves to an array of location post objects.
 */
export default function getLocationPosts() {
  return getPosts('location')
}
