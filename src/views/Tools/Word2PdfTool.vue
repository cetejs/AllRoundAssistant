<script setup>
import { ref } from 'vue'
import mammoth from 'mammoth'
import { jsPDF } from 'jspdf'

const file = ref(null)
const loading = ref(false)
const error = ref('')
const fileInput = ref(null)

const onFileChange = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  const ext = f.name.toLowerCase().slice(-5)
  if (!ext.includes('docx') && !ext.includes('doc')) {
    error.value = '请选择 Word 文档（.docx）'
    return
  }
  file.value = f
  error.value = ''
}

const convert = async () => {
  if (!file.value) {
    error.value = '请先选择 Word 文件'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const arrayBuffer = await file.value.arrayBuffer()
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer })
    const container = document.createElement('div')
    container.style.cssText = 'position:absolute;left:-9999px;top:0;width:595px;padding:40px;font-size:12px;line-height:1.5;font-family:SimSun,serif;'
    container.innerHTML = html
    document.body.appendChild(container)
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    await pdf.html(container, {
      x: 40,
      y: 40,
      width: 515,
      windowWidth: 600,
    })
    pdf.save(file.value.name.replace(/\.(docx?|doc)$/i, '') + '.pdf')
    document.body.removeChild(container)
  } catch (e) {
    error.value = e?.message || '转换失败'
  } finally {
    loading.value = false
  }
}

const reset = () => {
  file.value = null
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <input
      ref="fileInput"
      type="file"
      accept=".docx,.doc"
      class="hidden"
      @change="onFileChange"
    />
    <button
      type="button"
      class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
      @click="fileInput?.click()"
    >
      选择 Word 文件（.docx）
    </button>
    <p v-if="file" class="text-sm text-slate-600 dark:text-slate-400">{{ file.name }}</p>
    <div class="flex gap-2">
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50"
        :disabled="!file || loading"
        @click="convert"
      >
        {{ loading ? '转换中...' : '转换为 PDF' }}
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
      支持 .docx 格式，复杂排版可能略有偏差，本地处理不上传
    </p>
  </div>
</template>
