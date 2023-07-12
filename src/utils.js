const path = require('path')
const fs = require('fs-extra')
const bsdiff = require('bsdiff-node')

/**
 * Description
 * @param {any} sourceFolderPath 'a/b/c'
 * @param {any} filePath 'd/e/f/README.md'
 * @param {any} targetFolder 'x'
 */
async function copyToFolder(sourceFolderPath, filePath, targetFolder) {
  // 'x/d/e/f/README.md'
  const targetFilePath = path.join(targetFolder, filePath)
  // 'x/d/e/f'
  const targetDirPath = path.dirname(targetFilePath)

  await fs.ensureDir(targetDirPath)
  await fs.copy(path.join(sourceFolderPath, filePath), targetFilePath)
}

function doPatch(originFilePath, newFilePath, patchFilePath) {
  const consoleTimeLabel = `${newFilePath} generated`

  console.time(consoleTimeLabel)
  return new Promise(resolve => {
    bsdiff.patch(originFilePath, newFilePath, patchFilePath, (res) => {
      if (res === 100) {
        console.timeEnd(consoleTimeLabel)
        resolve(newFilePath)
      }
    })
  })
}

exports.copyToFolder = copyToFolder
exports.doPatch = doPatch
