const fs = require('fs-extra')
const path = require('path')
const { doDiff, convertPathSeparatorToUnderscore } = require('./utils')

async function generatePatches({ folderOfA, folderOfB, diffJson, doDiffThreshold, folderOfPatches, getBsdiff }) {
  const { modified } = diffJson

  // 1. find all filePath that needs bsdiff
  const needBsdiffFilePathList = []
  Object.keys(modified).forEach(filePath => {
    const newFileInfo = modified[filePath]
    if (newFileInfo.size > doDiffThreshold) {
      needBsdiffFilePathList.push(filePath)
    }
  })

  // 2. do bsdiff for each filePath, then gether all .patch files into a folder
  const bsdiffPromises = []

  for (const filePath of needBsdiffFilePathList) {
    const ver1FilePath = path.join(folderOfA, filePath)
    const ver2FilePath = path.join(folderOfB, filePath)
    const patchFilename = `${convertPathSeparatorToUnderscore(filePath)}.patch`
    const patchFilPath = path.join(folderOfPatches, patchFilename)
    const bsdiffPromise = doDiff(ver1FilePath, ver2FilePath, patchFilPath, getBsdiff)

    bsdiffPromises.push(bsdiffPromise)
  }

  const diffRes = await Promise.all(bsdiffPromises)
  return diffRes
}

module.exports = generatePatches
