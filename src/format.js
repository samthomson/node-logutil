const depthOf = obj => {
  let level = 1
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue
    }

    if (typeof obj[key] == 'object') {
      const depth = depthOf(obj[key]) + 1
      level = Math.max(depth, level)
    }
  }
  return level
}

module.exports = (...args) => {
  let output = {
    message: '',
    context: {},
    data: []
  }
  // Check for arguments
  if (args.length > 0) {
    if (args[0] instanceof Array) {
      // Stringify lists as the message and add as data
      output.message = args[0].join(', ')
      output.data = args[0]
    } else if (args[0] instanceof Object) {
      // Override logging output for objects (and errors)
      for (const key of Object.getOwnPropertyNames(args[0])) {
        output[key] = args[0][key]
      }
    } else {
      // Set primitive types as the message
      output.message = args[0]
    }
    if (args.length > 1) {
      if (args[1] instanceof Object) {
        // Set objects as secondary arguments as the context
        output.context = args[1]
      } else {
        // Set all other types as data
        output.data.push(args[1])
      }
    }
    if (args.length > 2) {
      for (let i = 2; i < args.length; i++) {
        // Set additional arguments as data
        output.data.push(args[i])
      }
    }
  }
  if (output.message === '') {
    // Remove empty messages
    delete output.message
  }
  if (Object.keys(output.context).length === 0) {
    // Remove empty contexts
    delete output.context
  }
  if (output.data.length === 0) {
    // Remove empty data
    delete output.data
  }
  // Stringify output
  const blob = JSON.stringify(output)
  // Check for size being less than than 100 KB
  if (blob.length <= 100 * 1024) {
    // Check for depth above 10
    if (depthOf(output) > 10) {
      // Wrap deep objects in a string
      return JSON.stringify({ message: 'Depth limited ' + blob })
    }
    return blob
  }
  // Truncate stringified output to 100 KB
  const truncated = blob.substring(0, 100 * 1024)
  // Wrap truncated output in a string
  return JSON.stringify({ message: 'Truncated ' + truncated })
}
