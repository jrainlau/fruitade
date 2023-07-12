const fs = require('fs')
const path = require('path')
const traverseDirectory = require('./traverseDirectory')
const diffFolderStructure = require('./diffFolderStructure')

async function checkGeneratedDir(sourceDir, targetDir) {
  const source = await traverseDirectory(sourceDir)
  const target = await traverseDirectory(targetDir)
  const { added, deleted, modified } = diffFolderStructure(source, target)

  return { added, deleted, modified }
}

module.exports = checkGeneratedDir
