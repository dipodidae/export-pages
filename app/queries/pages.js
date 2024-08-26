import connection from '../db.js'

export default async function () {
  const [rows] = await connection.execute(`
    SELECT ID, post_title, post_content, post_parent
    FROM wp_posts
    WHERE post_type = "page"
    AND post_status = "publish"
  `)

  return rows
}
