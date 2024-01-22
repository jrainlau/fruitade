const path = require('path')
const fs = require('fs-extra')
const { calculateFileMD5 } = require('./utils')

async function integrityDetect({ diffJson, folderOfNewPath }) {
  const oriNoAsarVal = process.noAsar
  process.noAsar = true

  const { added, modified, unchanged } = diffJson
  const allNewFiles = { ...added, ...unchanged, ...modified }

  const checkPromises = Object.entries(allNewFiles).map(async ([filePath, fileInfo]) => {
    if (!fileInfo.md5) {
      return { filePath, fileInfo, checkRes: true, msg: '' }
    }

    const targetFilePath = path.join(folderOfNewPath, filePath)

    if (!fs.existsSync(targetFilePath)) {
      return { targetFilePath, fileInfo, checkRes: false, msg: 'file not exists' }
    }

    if (fs.statSync(targetFilePath).isDirectory()) {
      return { targetFilePath, fileInfo, checkRes: true, msg: 'skip checking directory' }
    }

    const fileMD5 = await calculateFileMD5(targetFilePath)
    const recordMD5 = fileInfo.md5

    return { targetFilePath, fileInfo, checkRes: fileMD5 === recordMD5, msg: `fileMD5: ${fileMD5}; recordMD5: ${recordMD5}` }
  })

  const res = await Promise.all(checkPromises)

  process.noAsar = oriNoAsarVal

  return res
}

module.exports = integrityDetect
