const path = require('path')
const fs = require('fs-extra')
const generateDiffJson = require('../src/generateDiffJson')
const generatePatches = require('../src/generatePatches')

const getBsdiff = () => require('bsdiff-node')

describe('Test generateDiffJson() and generatePatches()', () => {
  const folderOfA = path.resolve(__dirname, './folderOfA')
  const folderOfB = path.resolve(__dirname, './folderOfB')
  const folderOfPatches = path.resolve(__dirname, './folderOfPatches')
  const diffJsonFilePath = path.resolve(__dirname, './diff.json')

  afterAll(() => {
    fs.removeSync(folderOfPatches)
    fs.removeSync(diffJsonFilePath)
  })

  test('generateDiffJson()', async () => {
    await generateDiffJson(folderOfA, folderOfB, diffJsonFilePath)
  
    expect(fs.existsSync(diffJsonFilePath)).toBe(true)
  })

  test('generatePatches()', async () => {
    const diffJson = JSON.parse(fs.readFileSync(diffJsonFilePath))
    await fs.ensureDir(folderOfPatches)
    const res = await generatePatches({ folderOfA, folderOfB, diffJson, doDiffThreshold: 5, folderOfPatches, getBsdiff })
    
    expect(fs.existsSync(res[0])).toBe(true)
  })
})