/**
 * 抠图 Web Worker - 在后台线程执行，不阻塞主线程
 */
self.onmessage = async (e) => {
  const { id, data, mimeType } = e.data
  if (!data) {
    self.postMessage({ id, error: '缺少图片数据', type: 'error' })
    return
  }
  try {
    const { removeBackground } = await import('@imgly/background-removal')
    const blob = new Blob([data], { type: mimeType || 'image/png' })
    const result = await removeBackground(blob, { proxyToWorker: true })
    const arrayBuffer = await result.arrayBuffer()
    self.postMessage({ id, blob: arrayBuffer, type: 'success' }, [arrayBuffer])
  } catch (err) {
    self.postMessage({ id, error: err?.message || '抠图失败', type: 'error' })
  }
}
