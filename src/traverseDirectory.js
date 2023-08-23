const fs = require('fs-extra')
const path = require('path')
const { calculateFileMD5 } = require('./utils')
const { hashElement } = require('folder-hash')

async function traverseDirectory(dirPath, ignoreFileNames) {
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
      const isIgnoreFile = ignoreFileNames.includes(filename)

      if (isIgnoreFile) {
        const stat = await fs.stat(filePath)
        const md5 = stat.isDirectory() ? (await hashElement(filePath)).hash : await calculateFileMD5(filePath)

        ignoreFiles.push({
          filename,
          md5
        })
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

  return { dirs, symbolicLinks, ignoreFiles }
}

module.exports = traverseDirectory
