const fs = require('fs')
const traverseDirectory = require('./traverseDirectory')
const diffFolderStructure = require('./diffFolderStructure')

async function generateDiffJson(folderA, folderB, diffJsonFilePath) {
  const c = await traverseDirectory(folderA)
  const d = await traverseDirectory(folderB)
  const diff = diffFolderStructure(c, d)

  fs.writeFileSync(diffJsonFilePath, JSON.stringify(diff, null, 2), 'utf-8')
}

module.exports = generateDiffJson
