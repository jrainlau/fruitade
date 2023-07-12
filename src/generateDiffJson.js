const fs = require('fs')
const traverseDirectory = require('./traverseDirectory')
const diffFolderStructure = require('./diffFolderStructure')

async function generateDiffJson(folderOfA, folderOfB, diffJsonFilePath) {
  const c = await traverseDirectory(folderOfA)
  const d = await traverseDirectory(folderOfB)
  const diff = diffFolderStructure(c, d)

  fs.writeFileSync(diffJsonFilePath, JSON.stringify(diff, null, 2), 'utf-8')
}

module.exports = generateDiffJson
