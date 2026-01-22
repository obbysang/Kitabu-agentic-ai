import '@testing-library/jest-dom'

class MockFileReader {
  result: string = ''
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  readAsDataURL(_file: Blob) {
    this.result = 'data:application/pdf;base64,AAA'
    if (this.onload) this.onload.call(this as unknown as FileReader, {} as any)
  }
}

// @ts-ignore
global.FileReader = MockFileReader as any
