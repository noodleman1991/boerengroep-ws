import { describe, expect, it } from 'vitest'
import { fileInfo, fileSize } from './files'

describe('files for download', () => {
  it('writes a size people can read', () => {
    expect(fileSize(900)).toBe('900 bytes')
    expect(fileSize(15_300)).toBe('15 kB')
    expect(fileSize(1_250_000)).toBe('1.3 MB')
    expect(fileSize(25_000_000)).toBe('25 MB')
    expect(fileSize(0)).toBeUndefined()
    expect(fileSize(null)).toBeUndefined()
  })

  it('names the kind of file in plain words', () => {
    const kind = (mimeType: string, filename = 'x') => fileInfo({ id: 1, url: '/f', mimeType, filename } as never)?.kind
    expect(kind('application/pdf')).toBe('PDF')
    expect(kind('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('Word')
    expect(kind('application/msword')).toBe('Word')
    expect(kind('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('Excel')
    expect(kind('application/vnd.openxmlformats-officedocument.presentationml.presentation')).toBe('PowerPoint')
    expect(kind('application/vnd.oasis.opendocument.text')).toBe('OpenDocument')
    expect(kind('text/csv')).toBe('CSV')
    expect(kind('image/jpeg')).toBe('JPEG')
    expect(kind('application/octet-stream', 'plan.KEY')).toBe('KEY')
    expect(kind('application/octet-stream', 'noextension')).toBe('File')
  })

  it('uses the given name, or else a tidy version of the file name', () => {
    const doc = { id: 1, url: 'https://blob/Annual_report-2025.final.pdf', filename: 'Annual_report-2025.final.pdf', mimeType: 'application/pdf', filesize: 1_250_000 }
    expect(fileInfo(doc as never, 'Annual report')).toEqual({ url: doc.url, name: 'Annual report', kind: 'PDF', size: '1.3 MB', filename: doc.filename })
    expect(fileInfo(doc as never)?.name).toBe('Annual report 2025.final')
    expect(fileInfo(doc as never, '  ')?.name).toBe('Annual report 2025.final')
  })

  it('gives nothing for a file that is not there', () => {
    expect(fileInfo(5 as never)).toBeNull()
    expect(fileInfo(null)).toBeNull()
    expect(fileInfo({ id: 1 } as never)).toBeNull()
  })
})
