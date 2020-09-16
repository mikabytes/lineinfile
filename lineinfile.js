import fs from "fs/promises"

// ansible inspired function to ensure a specified state in file
//
// path: the path to the file to ensure state for
// regex: a regex for searching for line, if unset will use literal 'line' matching
// line: What should be printed instead of regex (or a new line)
// state: [absent/present] whether to remove the line or ensure it is set
export default async function lineInFile({
  path,
  regex,
  line: lineToAdd,
  state = `present`,
}) {
  let file
  try {
    file = await fs.open(path, "r+")
  } catch (e) {
    if (e.code === `ENOENT`) {
      if (state === `absent`) {
        // nothing to do
        return
      } else {
        // create it
        file = await fs.open(path, `w+`)
      }
    } else {
      throw e
    }
  }

  const lines = (await file.readFile({ encoding: `utf8` })).split(`\n`)
  file.close()

  const resultLines = []
  let changed = false

  if (state === `absent`) {
    for (const line of lines) {
      if (regex) {
        if (!line.match(regex)) {
          resultLines.push(line)
        } else {
          changed = true
        }
      } else {
        if (line != lineToAdd) {
          resultLines.push(line)
        } else {
          changed = true
        }
      }
    }
  } else if (state === `present`) {
    let found = false

    for (const line of lines) {
      if (regex) {
        if (line.match(regex)) {
          if (!found) {
            resultLines.push(lineToAdd)
            found = true

            if (line !== lineToAdd) {
              changed = true
            }
          } else {
            changed = true
          }
        } else {
          resultLines.push(line)
        }
      } else {
        if (line === lineToAdd) {
          found = true
        }
        resultLines.push(line)
      }
    }

    if (!found) {
      // it's not present anywhere in file, so add it last
      resultLines.push(lineToAdd)
      changed = true
    }
  }

  if (changed) {
    await fs.writeFile(path, resultLines.join(`\n`))
  }
}
