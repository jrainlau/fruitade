const path = require('path')

function diffFolderStructure({
  folderInfoOfA,
  folderInfoOfB,
  ignoreFilesOfA,
  ignoreFilesOfB,
}) {
  const result = {
    added: {},
    deleted: {},
    modified: {},
    unchanged: {},
  };

  function traverse(folderInfoOfA, folderInfoOfB, path = []) {
    for (const key in folderInfoOfA) {
      if (!(key in folderInfoOfB)) {
        result.deleted[path.concat(key).join('/')] = folderInfoOfA[key];
      } else {
        if (typeof folderInfoOfA[key] === 'object' && typeof folderInfoOfB[key] === 'object') {
          if (isEmptyObject(folderInfoOfA[key]) && isEmptyObject(folderInfoOfB[key])) {
            result.unchanged[path.concat(key).join('/')] = ''
          }
          traverse(folderInfoOfA[key], folderInfoOfB[key], path.concat(key));
        } else {
          if (folderInfoOfA.size !== folderInfoOfB.size || folderInfoOfA.md5 !== folderInfoOfB.md5) {
            result.modified[path.join('/')] = folderInfoOfB;
          } else {
            result.unchanged[path.join('/')] = folderInfoOfA;
          }
        }
      }
    }

    for (const key in folderInfoOfB) {
      if (!(key in folderInfoOfA)) {
        result.added[path.concat(key).join('/')] = folderInfoOfB[key] || '';
      }
    }
  }

  traverse(folderInfoOfA, folderInfoOfB);

  result.added = flattenObject(result.added)

  ignoreFilesOfA.forEach(fileAInfo => {
    const { filename: filenameOfA, md5: md5OfA } = fileAInfo
    const [{ filename: filenameOfB, md5: md5OfB }] = ignoreFilesOfB.filter(fileBInfo => fileBInfo.filename === filenameOfA)

    if (md5OfA === md5OfB) {
      result.unchanged[filenameOfB] = { md5: md5OfB }
    } else {
      result.added[filenameOfB] = { md5: md5OfB }
    }
  })

  return result;
}

function flattenObject(obj, prefix = '', result = {}) {
  for (let key in obj) {
    if (!obj[key].filename) {
      flattenObject(obj[key], `${prefix}${key}/`, result);
    } else {
      result[`${prefix}${key}`] = obj[key];
    }
  }
  return result;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0
}

module.exports = diffFolderStructure
