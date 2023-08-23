const path = require('path')

function diffFolderStructure(a, b, ignoreFiles) {
  const result = {
    added: {},
    deleted: {},
    modified: {},
    unchanged: {},
  };

  function traverse(a, b, path = []) {
    for (const key in a) {
      if (!(key in b)) {
        result.deleted[path.concat(key).join('/')] = a[key];
      } else {
        if (typeof a[key] === 'object' && typeof b[key] === 'object') {
          if (isEmptyObject(a[key]) && isEmptyObject(b[key])) {
            result.unchanged[path.concat(key).join('/')] = ''
          }
          traverse(a[key], b[key], path.concat(key));
        } else {
          if (a.size !== b.size || a.md5 !== b.md5) {
            result.modified[path.join('/')] = b;
          } else {
            result.unchanged[path.join('/')] = a;
          }
        }
      }
    }

    for (const key in b) {
      if (!(key in a)) {
        result.added[path.concat(key).join('/')] = b[key] || '';
      }
    }
  }

  traverse(a, b);

  result.added = flattenObject(result.added)

  // all ignoreFiles as added
  ignoreFiles.forEach(ignoreFile => {
    result.added[ignoreFile] = {}
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
