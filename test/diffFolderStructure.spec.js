const fs = require('fs-extra')
const path = require('path')
const diffFolderStructure = require('../src/diffFolderStructure')
const traverseDirectory = require('../src/traverseDirectory')

test('diffFolderStructure()', async () => {
  const folderOfA = path.resolve(__dirname, './folderOfA')
  const folderOfB = path.resolve(__dirname, './folderOfB')

  const fileInfoA = await traverseDirectory(folderOfA)
  const fileInfoB = await traverseDirectory(folderOfB)

  const diff = diffFolderStructure(fileInfoA, fileInfoB)

  expect(diff.hasOwnProperty('added')).toBe(true)
  expect(diff.added.hasOwnProperty('a_new_folder_of_b/fileB.md')).toBe(true)
  expect(Object.keys(diff.modified).length > 0).toBe(true)
})