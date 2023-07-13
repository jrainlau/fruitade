const path = require('path')
const fs = require('fs-extra')
const { generatePatchPackage, generateNewVersionPackage } = require('../src/index.js')

describe('Test generatePatchPackage() and generateNewVersionPackage()', () => {
  const folderOfA = path.resolve(__dirname, './folderOfA')
  const folderOfB = path.resolve(__dirname, './folderOfB')
  const folderOfNewVersion = path.resolve(__dirname, './folderOfNewVersion')
  const folderOfPatches = path.resolve(__dirname, './folderOfPatches2')
  const doDiffThreshold = 5

  afterAll(() => {
    fs.removeSync(folderOfPatches)
    fs.removeSync(folderOfNewVersion)
  })

  test('generatePatchPackage()', async () => {
    await generatePatchPackage({
      folderOfA,
      folderOfB,
      folderOfPatches,
      doDiffThreshold,
    })

    const fileList = fs.readdirSync(folderOfPatches)

    expect(fileList.includes('10b.md.patch')).toBe(true)
    expect(fileList.includes('diff.json')).toBe(true)
    expect(fileList.includes('new_version')).toBe(true)

    const stat = fs.statSync(path.join(folderOfPatches, 'new_version'))
    expect(stat.isDirectory()).toBe(true)
  })

  test('generateNewVersionPackage()', async () => {
    await generateNewVersionPackage({
      folderOfA,
      folderOfPatches,
      folderOfNewVersion,
    })

    const fileBInfolderOfBContent = fs.readFileSync(path.join(folderOfB, 'a_new_folder_of_b', 'fileB.md'), 'utf-8')
    const fileBInfolderOfNewVersionContent = fs.readFileSync(path.join(folderOfNewVersion, 'a_new_folder_of_b', 'fileB.md'), 'utf-8')
    expect(fileBInfolderOfNewVersionContent).toEqual(fileBInfolderOfBContent)
  })
})
