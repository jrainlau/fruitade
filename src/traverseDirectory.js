const fs = require('fs')
const path = require('path')
const { calculateFileMD5 } = require('./utils')

async function traverseDirectory(dirPath, ignoreExts) {
  const rootDirPath = dirPath
  const dirs = {}
  const symbolicLinks = []
  const ignoreFiles = []

  async function traverse(dirPath, dirs) {
    const filenameList = fs.readdirSync(dirPath)

    for (const filename of filenameList) {
      if (filename === '.DS_Store') continue
      const filePath = path.join(dirPath, filename)
      const stat = fs.lstatSync(filePath)
      const { size } = stat
      const isDirectory = stat.isDirectory()
      const isSymbolicLink = stat.isSymbolicLink()
      const isIgnoreFile = ignoreExts.includes(path.extname(filePath))

      if (isIgnoreFile) {
        ignoreFiles.push(filePath.replace(rootDirPath, ''))
      }

      if (!isDirectory && !isSymbolicLink && !isIgnoreFile) {
        dirs[filename] = {
          filename,
          size,
          md5: await calculateFileMD5(filePath)
        }
      }
      
      if (isDirectory && !isIgnoreFile) {
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

  // console.log({ dirs, symbolicLinks, ignoreFiles })

  return { dirs, symbolicLinks, ignoreFiles }
}

module.exports = traverseDirectory
