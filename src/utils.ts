import ClipboardJS from 'clipboard'

export function copy(text: string) {
  let ele: HTMLDivElement | null = document.createElement('div')
  const clipboard = new ClipboardJS(ele, {
    text: () => text,
  })
  clipboard.on('success', clear)
  clipboard.on('error', clear)
  ele.click()

  function clear() {
    clipboard.destroy()
    ele = null
  }
}

export function toUpperCaseFirst(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
