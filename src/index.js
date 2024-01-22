const fs = require('fs-extra')
const path = require('path')

const traverseDirectory = require('./traverseDirectory')
const diffFolderStructure = require('./diffFolderStructure')
const generatePatches = require('./generatePatches')
const { copyToFolder, doPatch, convertPathSeparatorToUnderscore } = require('./utils')
const integrityDetect = require('./integrityDetect')

/**
 * @typedef {Object.<string, { filename: string; md5: string; size: number }>} FileInfo
 */

/**
 * @typedef {Object} DiffInfo
 * @property {FileInfo} added
 * @property {FileInfo} deleted
 * @property {FileInfo} modified
 * @property {FileInfo} unchanged
 */

/**
 * Description
 * @param {string} folderOfA path of folderOfA
 * @param {string} folderOfB path of folderOfB
 * @param {string} folderOfPatches path of patchPackage
 * @param {string} doDiffThreshold in kb
 * @param {Function} getBsdiff return the bsdiff instance
 * @param {Array} ignoreFileNames files or directories of these exts should be put to raw_files directly
 */
async function generatePatchPackage({ folderOfA, folderOfB, folderOfPatches, doDiffThreshold = 1024 * 500, getBsdiff, ignoreFileNames = [] }) {
  /** @type {FileInfo} */
  const { dirs: folderInfoOfA, ignoreFiles: ignoreFilesOfA } = await traverseDirectory(folderOfA, ignoreFileNames)
  /** @type {FileInfo} */
  const { dirs: folderInfoOfB, ignoreFiles: ignoreFilesOfB } = await traverseDirectory(folderOfB, ignoreFileNames)
  /** @type {DiffInfo} */
  const diffJson = diffFolderStructure({
    folderInfoOfA,
    folderInfoOfB,
    ignoreFilesOfA,
    ignoreFilesOfB,
  })

  const diffJsonPath = path.join(folderOfPatches, 'diff.json')

  await fs.ensureDir(folderOfPatches)
  await fs.emptyDir(folderOfPatches)
  await fs.writeFile(diffJsonPath, JSON.stringify(diffJson, null, 2), 'utf-8')

  const { added, modified } = diffJson
  // copy all added files into folderOfPatches
  Object.keys(added).forEach(async (filePath) => {
    await copyToFolder(folderOfB, filePath, path.join(folderOfPatches, 'raw_files'))
  })

  // copy all modified files which is smaller than doDiffThreshold into folderOfPatches
  Object.keys(modified).forEach(async (filePath) => {
    if (modified[filePath].size > doDiffThreshold) return
    await copyToFolder(folderOfB, filePath, path.join(folderOfPatches, 'raw_files'))
  })

  await generatePatches({
    folderOfA,
    folderOfB,
    diffJson,
    doDiffThreshold,
    folderOfPatches,
    getBsdiff,
  })
}

/**
 * Description
 * @param {string} folderOfA
 * @param {string} folderOfPatches
 * @param {string} folderOfNewVersion
 * @param {Function} getBsdiff return the bsdiff instance
 */
async function generateNewVersionPackage({ folderOfA, folderOfPatches, folderOfNewVersion, getBsdiff }) {
  const oriNoAsarVal = process.noAsar
  process.noAsar = true
  // 1. init folderOfNewVersion folder
  fs.removeSync(folderOfNewVersion)
  fs.mkdirSync(folderOfNewVersion)

  // 2. copy all unchanged files into folderOfNewVersion folder
  const diffJson = JSON.parse(fs.readFileSync(path.join(folderOfPatches, 'diff.json')))
  const { added, unchanged, modified } = diffJson
  
  Object.keys(unchanged).forEach(filePath => {
    copyToFolder(folderOfA, filePath, folderOfNewVersion)
  })

  // 3. use bsdiff to patch files
  const doPatchPromises = []

  Object.keys(modified).forEach(filePath => {
    const patchFileName = `${convertPathSeparatorToUnderscore(filePath)}.patch`
    const existsPatchFiles = fs.readdirSync(folderOfPatches)
    // These files should be generated by bsdiff.patch
    if (existsPatchFiles.includes(patchFileName)) {
      const originFilePath = path.join(folderOfA, filePath)
      const newFilePath = path.join(folderOfNewVersion, filePath)
      
      fs.ensureDirSync(path.dirname(newFilePath))
      const doPatchPromise = doPatch(originFilePath, newFilePath, path.join(folderOfPatches, patchFileName), getBsdiff)
      doPatchPromises.push(doPatchPromise)
    }
  })

  const res = await Promise.all(doPatchPromises)

  // 4、just copy to folderOfNewVersion
  // NOTE: In electron, .asar file would cause error while using fsExtra.copy
  // https://github.com/jprichardson/node-fs-extra/issues/637
  fs.copySync(path.join(folderOfPatches, 'raw_files'), folderOfNewVersion)

  process.noAsar = oriNoAsarVal

  return {
    diffJson,
    folderOfNewVersion,
  }
}

exports.generatePatchPackage = generatePatchPackage
exports.generateNewVersionPackage = generateNewVersionPackage
exports.integrityDetect = integrityDetect
