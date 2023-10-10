const path = require('path')
const { calculateFileMD5 } = require('./utils')

async function checkFiles({ diffJson, folderOfNewPath }) {
  const { added, modified, unchanged } = diffJson
  const allNewFiles = { ...added, ...unchanged, ...modified }

  const checkPromises = Object.entries(allNewFiles).map(async ([filePath, fileInfo]) => {
    if (!fileInfo.md5) {
      return
    }
    const fileMD5 = await calculateFileMD5(path.join(folderOfNewPath, filePath))
    const recordMD5 = fileInfo.md5

    return fileMD5 === recordMD5
  })

  const res = await Promise.all(checkPromises)

  return res.every(r => r)
}

module.exports = checkFiles
