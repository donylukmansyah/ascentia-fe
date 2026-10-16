export function isMacPlatform(platform: string) {
  return /Mac|iPhone|iPad|iPod/i.test(platform)
}

export function isSearchShortcut(
  event: Pick<
    KeyboardEvent,
    | 'key'
    | 'metaKey'
    | 'ctrlKey'
    | 'altKey'
    | 'shiftKey'
    | 'repeat'
    | 'isComposing'
  >,
  mac: boolean,
  editable: boolean,
) {
  return (
    !editable &&
    !event.repeat &&
    !event.isComposing &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === 'k' &&
    (mac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey)
  )
}
