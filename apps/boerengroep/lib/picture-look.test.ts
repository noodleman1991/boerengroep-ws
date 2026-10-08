import { describe, expect, it } from 'vitest'
import { gallerySize, pictureLook } from './picture-look'

describe('the look of a picture in a text', () => {
  it('is as wide as the text and in the middle when the editor chose nothing', () => {
    expect(pictureLook(null)).toEqual({ className: 'rich-figure rich-figure--full rich-figure--centre', sizes: '(max-width: 640px) 100vw, 800px', caption: undefined })
    expect(pictureLook({}).className).toBe('rich-figure rich-figure--full rich-figure--centre')
  })
  it('follows the size and the place the editor chose', () => {
    expect(pictureLook({ size: 'small', place: 'left' }).className).toBe('rich-figure rich-figure--small rich-figure--left')
    expect(pictureLook({ size: 'medium', place: 'right' })).toMatchObject({ className: 'rich-figure rich-figure--medium rich-figure--right', sizes: '(max-width: 640px) 100vw, 420px' })
  })
  it('keeps a large picture in the middle: there is no room for text beside it', () => {
    expect(pictureLook({ size: 'large', place: 'left' }).className).toBe('rich-figure rich-figure--large rich-figure--centre')
    expect(pictureLook({ size: 'full', place: 'right' }).className).toBe('rich-figure rich-figure--full rich-figure--centre')
  })
  it('ignores a size or a place it does not know', () => {
    expect(pictureLook({ size: 'huge', place: 'top' }).className).toBe('rich-figure rich-figure--full rich-figure--centre')
  })
  it('passes on a line written for this place, without spaces around it', () => {
    expect(pictureLook({ caption: '  The yard in May ' }).caption).toBe('The yard in May')
    expect(pictureLook({ caption: '   ' }).caption).toBeUndefined()
  })
})

describe('the size of the photos in a gallery', () => {
  it('is what the editor chose, or the usual one', () => {
    expect(gallerySize('small')).toBe('small')
    expect(gallerySize(undefined)).toBe('mosaic')
    expect(gallerySize('giant', 'medium')).toBe('medium')
  })
})
