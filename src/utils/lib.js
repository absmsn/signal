function checkMobileMode() {
  let ratio = document.body.clientWidth / document.body.clientHeight
  return ratio < 1
}

function binarySearch(arr, key, value) {
  if (arr instanceof Array) {
    let s = 0,
      e = arr.length,
      m = (s + e) >> 1,
      cur
    while (s !== e) {
      cur = key===""?arr[m]:arr[m][key]
      try {
        if (cur > value) {
          e = m - 1
        } else if (cur < value) {
          s = m + 1
        } else {
          return arr[m]
        }
        m = (s + e) >> 1
      } catch (Exception) {
        break
      }
    }
  }
}

export {
  checkMobileMode,
  binarySearch
}
