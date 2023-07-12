const path = require('path')
const traverseDirectory = require('../src/traverseDirectory')

test('traverseDirectory()', async () => {
  const targetDir = path.resolve(__dirname, './folderOfB')
  const res = await traverseDirectory(targetDir)

  expect(res.hasOwnProperty('10b.md')).toBe(true)
  expect(res['a_new_folder_of_b']['fileB.md']['filename']).toBe('fileB.md')
})
