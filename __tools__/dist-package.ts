import oldPackage from '../package.json'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const newPackage = {
  ...oldPackage,
  scripts: {
    "start": "cross-env NODE_ENV=production node ./index.js",
    "start:dev": "cross-env NODE_ENV=development node ./index.js",
    "start:local": "cross-env NODE_ENV=local node ./index.js",
  },
  devDependencies: {}
}

const outPath = resolve(__dirname, '../dist/package.json')
writeFileSync(outPath, JSON.stringify(newPackage, null, 2))
