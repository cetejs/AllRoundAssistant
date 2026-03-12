<script setup>
import { ref } from 'vue'
import lamejs from 'lamejs'

const file = ref(null)
const fileUrl = ref('')
const loading = ref(false)
const error = ref('')
const progress = ref(0)
const outputFormat = ref('mp3') // mp3 | wav
const outputBlob = ref(null)
const fileInput = ref(null)

const onFileChange = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (!f.type.startsWith('audio/') && !['.mp3', '.wav', '.ogg', '.m4a', '.aac'].some((ext) => f.name.toLowerCase().endsWith(ext))) {
    error.value = '请选择音频文件（MP3、WAV、OGG、M4A 等）'
    return
  }
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)
  file.value = f
  fileUrl.value = URL.createObjectURL(f)
  outputBlob.value = null
  error.value = ''
}

const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const channels = []
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }
  const len = channels[0].length * numChannels * 2 + 44
  const arr = new Uint8Array(len)
  const view = new DataView(arr.buffer)
  const write = (offset, val) => view.setUint32(offset, val, true)
  view.setUint8(0, 0x52)
  view.setUint8(1, 0x49)
  view.setUint8(2, 0x46)
  view.setUint8(3, 0x46)
  write(4, len - 8)
  view.setUint8(8, 0x57)
  view.setUint8(9, 0x41)
  view.setUint8(10, 0x56)
  view.setUint8(11, 0x45)
  view.setUint8(12, 0x66)
  view.setUint8(13, 0x6d)
  view.setUint8(14, 0x74)
  view.setUint8(15, 0x20)
  write(16, 16)
  write(20, 1)
  write(22, numChannels)
  write(24, sampleRate)
  write(28, sampleRate * numChannels * 2)
  write(32, numChannels * 2)
  write(34, 16)
  view.setUint8(36, 0x64)
  view.setUint8(37, 0x61)
  view.setUint8(38, 0x74)
  view.setUint8(39, 0x61)
  write(40, len - 44)
  let offset = 44
  const len2 = channels[0].length
  for (let i = 0; i < len2; i++) {
    for (let c = 0; c < numChannels; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      offset += 2
    }
  }
  return new Blob([arr], { type: 'audio/wav' })
}

const audioBufferToMp3 = (buffer) => {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const left = buffer.getChannelData(0)
  const right = numChannels > 1 ? buffer.getChannelData(1) : left
  const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, 128)
  const sampleBlockSize = 1152
  const mp3Data = []
  for (let i = 0; i < left.length; i += sampleBlockSize) {
    const leftChunk = left.subarray(i, i + sampleBlockSize)
    const rightChunk = right.subarray(i, i + sampleBlockSize)
    const leftInt = new Int16Array(leftChunk.length)
    const rightInt = new Int16Array(rightChunk.length)
    for (let j = 0; j < leftChunk.length; j++) {
      leftInt[j] = Math.max(-32768, Math.min(32767, leftChunk[j] * 32768))
      rightInt[j] = Math.max(-32768, Math.min(32767, rightChunk[j] * 32768))
    }
    const mp3buf = mp3encoder.encodeBuffer(leftInt, rightInt)
    if (mp3buf.length > 0) mp3Data.push(mp3buf)
  }
  const mp3buf = mp3encoder.flush()
  if (mp3buf.length > 0) mp3Data.push(mp3buf)
  return new Blob(mp3Data, { type: 'audio/mp3' })
}

const convert = async () => {
  if (!file.value) {
    error.value = '请先选择音频文件'
    return
  }
  error.value = ''
  loading.value = true
  progress.value = 0
  outputBlob.value = null
  try {
    const arrayBuffer = await file.value.arrayBuffer()
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    progress.value = 50
    let blob
    if (outputFormat.value === 'wav') {
      blob = audioBufferToWav(audioBuffer)
    } else {
      blob = audioBufferToMp3(audioBuffer)
    }
    progress.value = 100
    outputBlob.value = blob
  } catch (e) {
    error.value = e?.message || '转换失败，请确保为支持的音频格式'
  } finally {
    loading.value = false
    progress.value = 0
  }
}

const download = () => {
  if (!outputBlob.value) return
  const ext = outputFormat.value === 'mp3' ? 'mp3' : 'wav'
  const base = file.value?.name?.replace(/\.[^.]+$/, '') || 'audio'
  const a = document.createElement('a')
  a.href = URL.createObjectURL(outputBlob.value)
  a.download = `${base}.${ext}`
  a.click()
  URL.revokeObjectURL(a.href)
}

const reset = () => {
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)
  file.value = null
  fileUrl.value = ''
  outputBlob.value = null
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <input
      ref="fileInput"
      type="file"
      accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
      class="hidden"
      @change="onFileChange"
    />
    <button
      type="button"
      class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
      @click="fileInput?.click()"
    >
      选择音频文件
    </button>
    <p v-if="file" class="text-sm text-slate-600 dark:text-slate-400">{{ file.name }}</p>
    <div>
      <label class="block text-sm text-slate-600 dark:text-slate-400 mb-1">转换为</label>
      <select
        v-model="outputFormat"
        class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
      >
        <option value="mp3">MP3</option>
        <option value="wav">WAV</option>
      </select>
    </div>
    <div class="flex gap-2">
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50"
        :disabled="!file || loading"
        @click="convert"
      >
        {{ loading ? `转换中 ${progress}%` : '开始转换' }}
      </button>
      <button
        v-if="outputBlob"
        type="button"
        class="px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm"
        @click="download"
      >
        下载 {{ outputFormat }}
      </button>
      <button
        v-if="file"
        type="button"
        class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-400 text-sm"
        @click="reset"
      >
        清空
      </button>
    </div>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      支持 MP3、WAV、OGG、M4A 等格式，可转换为 MP3 或 WAV，本地处理不上传
    </p>
  </div>
</template>
