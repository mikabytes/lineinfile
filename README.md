# lineinfile

Ansible inspired function to ensure a specified file is added, changed or removed from a file

Example Usage:

```javascript
import lineInFile from `lineinfile`

await lineInFile({
  path: `/my/file`,              // the path to the file to ensure state for
  regex: /env ?= ?'production'/, // a regex for searching for line, if unset will use literal 'line' matching
  line: `env = 'development'`,   // What should be printed instead of regex (or a new line)
  state: `present`               // [absent/present] whether to remove the line or ensure it is set
})
```



