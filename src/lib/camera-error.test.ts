import { cameraErrorKey } from '@/lib/camera-error'

const named = (name: string) => Object.assign(new Error('boom'), { name })

describe('cameraErrorKey', () => {
  it('recognises a refused permission', () => {
    expect(cameraErrorKey(named('NotAllowedError'))).toBe('permissionDenied')
  })

  it('treats an insecure context as a refused permission', () => {
    expect(cameraErrorKey(named('SecurityError'))).toBe('permissionDenied')
  })

  it('recognises a device with no camera', () => {
    expect(cameraErrorKey(named('NotFoundError'))).toBe('noCamera')
    expect(cameraErrorKey(named('DevicesNotFoundError'))).toBe('noCamera')
  })

  it('falls back to the generic failure', () => {
    expect(cameraErrorKey(named('NotReadableError'))).toBe('cameraError')
    expect(cameraErrorKey('a string')).toBe('cameraError')
    expect(cameraErrorKey(undefined)).toBe('cameraError')
  })
})
