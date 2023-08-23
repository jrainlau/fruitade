const fs = require('fs')
const path = require('path')
const { calculateFileMD5 } = require('./utils')

async function traverseDirectory(dirPath) {
  const rootDirPath = dirPath
  const dirs = {}
  const symbolicLinks = []
  const frameworks = []

  async function traverse(dirPath, dirs) {
    const filenameList = fs.readdirSync(dirPath)

    for (const filename of filenameList) {
      if (filename === '.DS_Store') continue
      const filePath = path.join(dirPath, filename)
      const stat = fs.lstatSync(filePath)
      const { size } = stat
      const isDirectory = stat.isDirectory()
      const isSymbolicLink = stat.isSymbolicLink()
      const isFramework = path.extname(filePath) === '.framework'

      if (isFramework) {
        frameworks.push(filePath.replace(rootDirPath, ''))
      }

      if (!isDirectory && !isSymbolicLink && !isFramework) {
        dirs[filename] = {
          filename,
          size,
          md5: await calculateFileMD5(filePath)
        }
      }
      
      if (isDirectory && !isFramework) {
        dirs[filename] = {}
        await traverse(filePath, dirs[filename])
      }
      
      if (isSymbolicLink) {
        const symbolicLinkPath = `${dirPath}/${filename}`.replace(rootDirPath, '')
        symbolicLinks.push(symbolicLinkPath)
      }
    }
  }

  await traverse(dirPath, dirs)

  return { dirs, symbolicLinks, frameworks }
}

module.exports = traverseDirectory
