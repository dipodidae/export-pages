import connection from '../db.js'

/**
 * Queries the metadata for a given post ID from the wp_postmeta table.
 *
 * @param {number} postId - The ID of the post to query metadata for.
 * @returns {Promise<Array<{meta_key: string, meta_value: string}>>} A promise that resolves to an array of metadata objects.
 * @throws {Error} Throws an error if the query fails.
 */
async function query(postId) {
  try {
    const [rows] = await connection.execute(`
      SELECT meta_key, meta_value
      FROM wp_postmeta
      WHERE post_id = ?
    `, [postId])
    return rows
  }
  catch (error) {
    throw new Error(`Failed to query metadata for post ID ${postId}: ${error.message}`)
  }
}

/**
 * Retrieves and transforms metadata for a given post ID.
 *
 * @param {number} postId - The ID of the post to retrieve metadata for.
 * @returns {Promise<object>} A promise that resolves to an object containing the metadata key-value pairs.
 * @throws {Error} Throws an error if the query fails.
 */
export default async function getMetadata(postId) {
  try {
    const rows = await query(postId)
    return rows.reduce((metaData, { meta_key, meta_value }) => {
      metaData[meta_key] = meta_value
      return metaData
    }, {})
  }
  catch (error) {
    throw new Error(`Failed to retrieve metadata for post ID ${postId}: ${error.message}`)
  }
}
