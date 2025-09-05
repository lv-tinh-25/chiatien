export type CameraErrorKey = 'permissionDenied' | 'noCamera' | 'cameraError'

/**
 * Maps a getUserMedia rejection onto the message that tells the person what to
 * do about it. The DOMException name is the only reliable discriminator: the
 * message text varies by browser and is not localised.
 */
export function cameraErrorKey(error: unknown): CameraErrorKey {
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String(error.name)
      : ''

  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'permissionDenied'
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError')
    return 'noCamera'
  return 'cameraError'
}
