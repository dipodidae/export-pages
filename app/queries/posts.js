import connection from '../db.js'
import getMetadata from './meta-data.js'

/**
 * Executes a query to retrieve posts of a specific type from the database, including the post thumbnail URL.
 *
 * @param {string} postType - The type of posts to retrieve.
 * @returns {Promise<Array<any>>} A promise that resolves to the query result rows.
 * @throws {Error} Throws an error if the query fails.
 */
function query(postType) {
  return connection.execute(`
    SELECT
      p.ID,
      p.post_title,
      p.post_content,
      p.post_parent,
      t.guid AS thumbnail_url
    FROM wp_posts p
    LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
    LEFT JOIN wp_posts t ON pm.meta_value = t.ID
    WHERE p.post_type = ?
    AND p.post_status = "publish"
  `, [postType])
}

/**
 * Transforms a post object by adding metadata and ensuring the thumbnail URL is present.
 *
 * @param {object} post - The post object to transform.
 * @param {number} post.ID - The ID of the post.
 * @param {string} post.post_title - The title of the post.
 * @param {string} post.post_content - The content of the post.
 * @param {number} post.post_parent - The parent ID of the post.
 * @param {string} [post.thumbnail_url] - The URL of the post's thumbnail.
 * @returns {Promise<object>} A promise that resolves to the transformed post object.
 */
async function transformPost(post) {
  return {
    ID: post.ID,
    post_title: post.post_title,
    post_content: post.post_content,
    post_parent: post.post_parent,
    thumbnail_url: post.thumbnail_url || null,
    metaData: await getMetadata(post.ID),
  }
}

/**
 * Retrieves posts of a specific type from the database, including the post thumbnail URL.
 *
 * @param {string} postType - The type of posts to retrieve.
 * @returns {Promise<Array<{ID: number, post_title: string, post_content: string, post_parent: number, thumbnail_url: string | null}>>} A promise that resolves to an array of post objects with thumbnail URLs.
 * @throws {Error} Throws an error if the query fails.
 */
export default async function getPostsByType(postType) {
  try {
    const [posts] = await query(postType)

    return posts.map(transformPost)
  }
  catch (error) {
    throw new Error(`Failed to retrieve posts of type ${postType}: ${error.message}`)
  }
}
