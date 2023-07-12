const fs = require('fs-extra')
const path = require('path')
const bsdiff = require('bsdiff-node')

function doDiff(ver1FilePath, ver2FilePath, patchFilPath) {
  return new Promise(resolve => {
    const filename = patchFilPath.split(path.sep)[patchFilPath.split(path.sep).length - 1]
    const consoleTimeLabel = `${filename} generated`

    console.time(consoleTimeLabel)
    bsdiff.diff(ver1FilePath, ver2FilePath, patchFilPath, (result) => {
      if (result === 100) {
        console.timeEnd(consoleTimeLabel)
        resolve(patchFilPath)
      }
    })
  })
}

async function generatePatches({ folderA, folderB, diffJson, doDiffThreshold, folderPatch }) {
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
    const ver1FilePath = path.join(folderA, filePath)
    const ver2FilePath = path.join(folderB, filePath)
    const patchFilPath = path.join(folderPatch,`${modified[filePath].filename}.patch`)
    const bsdiffPromise = doDiff(ver1FilePath, ver2FilePath, patchFilPath)

    bsdiffPromises.push(bsdiffPromise)
  }

  console.time('\nFinish all diff operation')
  const diffRes = await Promise.all(bsdiffPromises)
  console.timeEnd('\nFinish all diff operation')
  return diffRes
}

module.exports = generatePatches
