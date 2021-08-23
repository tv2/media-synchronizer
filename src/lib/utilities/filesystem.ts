export function basename(path: string): string {
  const index = indexOfBasename(path)
  return path.slice(index).replace(/(\/|\\)$/, '')
}

function indexOfBasename(path: string): number {
  let index: number = path.search(/((?!(\/|\\(?! ))).)+(\/|\\)?$/)
  return index >= 0 ? index : 0
}

export function dir(path: string): string {
  const index = indexOfBasename(path)
  return normalizePath(index > 0 ? path.slice(0, index) : path)
}

export function join(pathElements: string[]) {
  const backslashIndex = pathElements.join('').search(/\\(?! )/)
  const slashIndex = pathElements.join('').search(/\//)
  let separator: string = ''
  switch (true) {
    case backslashIndex === -1 && slashIndex >= 0:
      separator = '/'
      break
    case slashIndex === -1 && backslashIndex >= 0:
      separator = '\\'
      break
    default:
      separator = slashIndex <= backslashIndex ? '/' : '\\'
  }
  return pathElements.join(separator)
}

export function normalizePath(path: string) {
  return path.replace(/[\\\/]+$/, '')
}

export function convertPath(path: string, sourceBase: string, targetBase: string) {
  return path.replace(normalizePath(sourceBase), normalizePath(targetBase))
}
