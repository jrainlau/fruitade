const path = require('path')
const fs = require('fs-extra')
const { calculateFileMD5 } = require('./utils')

async function checkFiles({ diffJson, folderOfNewPath }) {
  const { added, modified, unchanged } = diffJson
  const allNewFiles = { ...added, ...unchanged, ...modified }

  const checkPromises = Object.entries(allNewFiles).map(async ([filePath, fileInfo]) => {
    if (!fileInfo.md5) {
      return { filePath, fileInfo, checkRes: true, msg: '' }
    }

    const targetFilePath = path.join(folderOfNewPath, filePath)

    if (!fs.existsSync(targetFilePath)) {
      return { filePath, fileInfo, checkRes: false, msg: 'file not exists' }
    }

    const fileMD5 = await calculateFileMD5(path.join(folderOfNewPath, filePath))
    const recordMD5 = fileInfo.md5

    return { filePath, fileInfo, checkRes: fileMD5 === recordMD5, msg: `fileMD5: ${fileMD5}; recordMD5: ${recordMD5}` }
  })

  const res = await Promise.all(checkPromises)

  return res
}

module.exports = checkFiles
