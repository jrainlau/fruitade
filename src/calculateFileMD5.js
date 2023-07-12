const fs = require('fs')
const crypto = require('crypto')

function calculateFileMD5(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
    const hash = crypto.createHash('md5')

    stream.on('data', (data) => {
      hash.update(data)
    })

    stream.on('end', () => {
      const md5Hash = hash.digest('hex')
      resolve(md5Hash)
    })

    stream.on('error', (error) => {
      console.log(error)
      reject(error)
    })
  })
}

module.exports = calculateFileMD5
