import type { ObjectDirective } from 'vue'

const filePickerDirective: ObjectDirective = {
  mounted(el, binding) {
    const input = document.createElement('input')
    input.type = 'file'
    input.style.display = 'none'

    const config = binding.value || {}
    input.multiple = !!config.multiple
    input.accept = config.accept || '*'

    el.appendChild(input)
    el.addEventListener('click', () => input.click())

    input.addEventListener('change', (event) => {
      const inputElement = event.target as HTMLInputElement
      const rawFiles = Array.from(inputElement.files || [])
      
      const processed = rawFiles.filter(file => {
        const unsafe = ['.exe', '.bat', '.sh', '.js']
        return !unsafe.some(ext => file.name.toLowerCase().endsWith(ext))
      }).map(file => ({
        file,
        name: file.name,
        path: URL.createObjectURL(file),
        format: file.type || file.name.split('.').pop(),
        size: file.size
      }))

      if (processed.length > 0 && typeof config.onSelect === 'function') {
        config.onSelect(processed)
      }
      inputElement.value = ''
    })
  }
}

export default filePickerDirective