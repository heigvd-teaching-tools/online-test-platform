// pages/api/assets/[...path].js

import fs from 'fs'
import path from 'path'
import mime from 'mime'
import { promisify } from 'util'
import {
  withAuthorization,
  withMethodHandler,
} from '@/middleware/withAuthorization'
import { Role } from '@prisma/client'

const stat = promisify(fs.stat)
const readFile = promisify(fs.readFile)

const get = async (req, res) => {
  const { path: filePathArray } = req.query
  const filePath = filePathArray.join('/')

  // Construct the full path to the file
  const fullPath = path.resolve('./assets', filePath)

  try {
    const fileStat = await stat(fullPath)

    if (!fileStat.isFile()) {
      res.status(404).json({ message: 'File not found' })
      return
    }

    const fileContent = await readFile(fullPath)
    const mimeType = mime.getType(fullPath)

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Length', fileStat.size)
    res.status(200).send(fileContent)
  } catch (error) {
    console.error('Error serving file:', error)
    res.status(500).json({ message: 'Error serving file: ' + error.message })
  }
}

export default withMethodHandler({
  GET: withAuthorization(get, [Role.PROFESSOR, Role.SUPER_ADMIN, Role.STUDENT]),
})
