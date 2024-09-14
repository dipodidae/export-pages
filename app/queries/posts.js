import connection from '../db.js'

/**
 * Retrieves posts of a specific type from the database.
 *
 * @param {string} postType - The type of posts to retrieve.
 * @returns {Promise<Array<{ID: number, post_title: string, post_content: string, post_parent: number}>>} A promise that resolves to an array of post objects.
 * @throws {Error} Throws an error if the query fails.
 */
export default async function getPostsByType(postType) {
  try {
    const [rows] = await connection.execute(`
      SELECT
        p.ID,
        p.post_title,
        p.post_content,
        p.post_parent,
        pm.meta_value AS thumbnail_id,
        t.guid AS thumbnail_url
      FROM wp_posts p
      LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
      LEFT JOIN wp_posts t ON pm.meta_value = t.ID
      WHERE p.post_type = ?
      AND p.post_status = "publish"
    `, [postType])

    return rows
  }
  catch (error) {
    throw new Error(`Failed to retrieve posts of type ${postType}: ${error.message}`)
  }
}
