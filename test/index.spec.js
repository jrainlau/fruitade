const path = require('path')
const fs = require('fs-extra')
const { generatePatchPackage, generateNewVersionPackage, integrityDetect } = require('../src/index.js')

const getBsdiff = () => require('bsdiff-node')

describe('Test generatePatchPackage() and generateNewVersionPackage()', () => {
  const folderOfA = path.resolve(__dirname, './folderOfA')
  const folderOfB = path.resolve(__dirname, './folderOfB')
  const folderOfNewVersion = path.resolve(__dirname, './folderOfNewVersion')
  const folderOfPatches = path.resolve(__dirname, './folderOfPatches2')
  const doDiffThreshold = 5

  afterEach((done) => {
    setTimeout(() => {
      console.log(`Delay 2000ms to ensure files were fully generated.`)
      done()
    }, 2000);
  })

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
      getBsdiff,
    })

    const fileList = fs.readdirSync(folderOfPatches)

    expect(fileList.includes('10b.md.patch')).toBe(true)
    expect(fileList.includes('diff.json')).toBe(true)
    expect(fileList.includes('raw_files')).toBe(true)

    const stat = fs.statSync(path.join(folderOfPatches, 'raw_files'))
    expect(stat.isDirectory()).toBe(true)
  })

  test('generateNewVersionPackage()', async () => {
    const res = await generateNewVersionPackage({
      folderOfA,
      folderOfPatches,
      folderOfNewVersion,
      getBsdiff,
    })

    const fileBInfolderOfBContent = fs.readFileSync(path.join(folderOfB, 'a_new_folder_of_b', 'fileB.md'), 'utf-8')
    const fileBInfolderOfNewVersionContent = fs.readFileSync(path.join(folderOfNewVersion, 'a_new_folder_of_b', 'fileB.md'), 'utf-8')
    expect(fileBInfolderOfNewVersionContent).toEqual(fileBInfolderOfBContent)
    expect(typeof res).toBe('object')
  })

  test('integrityDetect', async () => {
    const diffJson = require('./folderOfPatches2/diff.json')
    const folderOfNewPath = folderOfNewVersion
    const checkResult = await integrityDetect({ diffJson, folderOfNewPath })
    const isCheckingPassed = checkResult.every(({ checkRes }) => checkRes)
    expect(isCheckingPassed).toBe(true)
  })
})
