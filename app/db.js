import process from 'node:process'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '',
  user: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
})

export default connection
