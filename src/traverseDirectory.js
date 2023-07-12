const fs = require('fs')
const path = require('path')
const { calculateFileMD5 } = require('./utils')

async function traverseDirectory(dirPath, ignoreList = []) {
  const dirs = {}

  async function traverse(dirPath, dirs) {
    const filenameList = fs.readdirSync(dirPath)

    for (const filename of filenameList) {
      if (filename === '.DS_Store') continue
      const filePath = path.join(dirPath, filename)
      const stat = fs.statSync(filePath)
      const { size } = stat
      const isDirectory = stat.isDirectory()
      if (!isDirectory) {
        dirs[filename] = {
          filename,
          size,
          md5: await calculateFileMD5(filePath)
        }
      } else if (isDirectory && !ignoreList.includes(filename)) {
        dirs[filename] = {}
        await traverse(filePath, dirs[filename])
      }
    }
  }

  await traverse(dirPath, dirs)

  return dirs
}

module.exports = traverseDirectory
