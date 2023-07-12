function diffFolderStructure(a, b) {
  const result = {
    added: {},
    deleted: {},
    modified: {},
    unchanged: {},
  };

  function traverse(a, b, path = []) {
    for (const key in a) {
      if (!(key in b)) {
        result.deleted[path.concat(key).join("/")] = a[key];
      } else {
        if (typeof a[key] === "object" && typeof b[key] === "object") {
          traverse(a[key], b[key], path.concat(key));
        } else {
          if (a.size !== b.size || a.md5 !== b.md5) {
            result.modified[path.join("/")] = b;
          } else {
            result.unchanged[path.join("/")] = a;
          }
        }
      }
    }

    for (const key in b) {
      if (!(key in a)) {
        result.added[path.concat(key).join("/")] = b[key];
      }
    }
  }

  traverse(a, b);

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

  result.added = flattenObject(result.added)

  return result;
}

module.exports = diffFolderStructure
