const path = require('path')
const fs = require('fs-extra')
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

  const sourceFilePath = path.join(sourceFolderPath, filePath)

  await fs.ensureDir(targetDirPath)

  if (!fs.existsSync(sourceFilePath)) return

  await fs.copy(sourceFilePath, targetFilePath)
}

function doPatch(originFilePath, newFilePath, patchFilePath, getBsdiff) {
  const bsdiffInstance = getBsdiff?.()
  if (!bsdiffInstance) throw new Error(`Cannot find bsdiff!`)

  return new Promise(resolve => {
    bsdiffInstance.patch(originFilePath, newFilePath, patchFilePath, (res) => {
      if (res === 100) {
        resolve(newFilePath)
      }
    })
  })
}

function doDiff(fileA, fileB, filePatch, getBsdiff) {
  const bsdiffInstance = getBsdiff?.()
  if (!bsdiffInstance) throw new Error(`Cannot find bsdiff!`)

  return new Promise(resolve => {
    const filename = filePatch.split(path.sep)[filePatch.split(path.sep).length - 1]

    bsdiffInstance.diff(fileA, fileB, filePatch, (result) => {
      if (result === 100) {
        resolve(filePatch)
      }
    })
  })
}

function convertPathSeparatorToUnderscore(filePath) {
  return filePath.split('/').join('_')
}

exports.calculateFileMD5 = calculateFileMD5
exports.copyToFolder = copyToFolder
exports.doDiff = doDiff
exports.doPatch = doPatch
exports.convertPathSeparatorToUnderscore = convertPathSeparatorToUnderscore
