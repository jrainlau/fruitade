const fs = require('fs-extra')
const path = require('path')

const {
  calculateFileMD5,
  copyToFolder,
  doDiff,
  doPatch,
} = require('../src/utils')

describe('Test utils.js', () => {
  test('calculateFileMD5()', async () => {
    const filePath = path.resolve(__dirname, './folderOfA/1b.md')
    const md5 = await calculateFileMD5(filePath)
    expect(md5).toBe('60b725f10c9c85c70d97880dfe8191b3')
  })

  test('copyToFolder()', async () => {
    const sourceFolder = path.resolve(__dirname, './folderOfB')
    const filePath = 'a_new_folder_of_b/fileB.md'
    const testFolder = path.resolve(__dirname, './aTestFolder')

    await copyToFolder(sourceFolder, filePath, testFolder)

    const finalPath = path.resolve(__dirname, './aTestFolder/a_new_folder_of_b/fileB.md')
    expect(fs.existsSync(finalPath)).toBe(true)
    fs.removeSync(testFolder)
  })

  test('doDiff()', async () => {
    const fileA = path.resolve(__dirname, './folderOfA/10b.md')
    const fileB = path.resolve(__dirname, './folderOfB/10b.md')
    const filePatch = path.resolve(__dirname, './10b.md.patch')

    await doDiff(fileA, fileB, filePatch)

    expect(fs.existsSync(filePatch)).toBe(true)
  })

  test('doPatch()', async () => {
    const fileA = path.resolve(__dirname, './folderOfA/10b.md')
    const fileB = path.resolve(__dirname, './folderOfB/10b.md')
    const fileNew = path.resolve(__dirname, './10b.md')
    const filePatch = path.resolve(__dirname, './10b.md.patch')

    await doPatch(fileA, fileNew, filePatch)

    const fileBMD5 = await calculateFileMD5(fileB)
    const fileNewMD5 = await calculateFileMD5(fileNew)

    expect(fs.existsSync(fileB)).toBe(true)
    expect(fileNewMD5).toEqual(fileBMD5)

    fs.removeSync(fileNew)
    fs.removeSync(filePatch)
  })
})
