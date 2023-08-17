const path = require('path')
const fs = require('fs-extra')
const bsdiff = require('bsdiff-node')
const crypto = require('crypto')

function calculateFileMD5(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
    const hash = crypto.createHash('md5')

    stream.on('data', (data) => {
      hash.update(data)
    })

    stream.on('end', () => {
      const md5Hash = hash.digest('hex')
      resolve(md5Hash)
    })

    stream.on('error', (error) => {
      console.log(error)
      reject(error)
    })
  })
}

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

function doPatch(originFilePath, newFilePath, patchFilePath, getBsdiff) {
  const consoleTimeLabel = `${newFilePath} generated`

  console.time(consoleTimeLabel)
  return new Promise(resolve => {
    const bsdiffInstance = getBsdiff?.() || bsdiff
    bsdiffInstance.patch(originFilePath, newFilePath, patchFilePath, (res) => {
      if (res === 100) {
        console.timeEnd(consoleTimeLabel)
        resolve(newFilePath)
      }
    })
  })
}

function doDiff(fileA, fileB, filePatch) {
  return new Promise(resolve => {
    const filename = filePatch.split(path.sep)[filePatch.split(path.sep).length - 1]
    const consoleTimeLabel = `${filename} generated`

    console.time(consoleTimeLabel)
    bsdiff.diff(fileA, fileB, filePatch, (result) => {
      if (result === 100) {
        console.timeEnd(consoleTimeLabel)
        resolve(filePatch)
      }
    })
  })
}

function convertPathSeparatorToUnderscore(filePath) {
  return filePath.split(path.sep).join('_')
}

exports.calculateFileMD5 = calculateFileMD5
exports.copyToFolder = copyToFolder
exports.doDiff = doDiff
exports.doPatch = doPatch
exports.convertPathSeparatorToUnderscore = convertPathSeparatorToUnderscore
