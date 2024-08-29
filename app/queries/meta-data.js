import connection from '../db.js'

export default async function (postId) {
  const [rows] = await connection.execute(`
    SELECT meta_key, meta_value
    FROM wp_postmeta
    WHERE post_id = ?
  `, [postId])

  return rows.reduce((metaData, { meta_key, meta_value }) => {
    metaData[meta_key] = meta_value

    return metaData
  }, {})
}
