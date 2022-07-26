import { BaseData } from './base.js'
import CSVData from './csv.js'
import JSONData from './json.js'
import ImageData from './image.js'
import AudioData from './audio.js'
import DocumentData from './document.js'

export default class UploadData extends BaseData {
	constructor(manager) {
		super(manager)
		const elm = this.setting.data.configElement
		const fileInput = document.createElement('input')
		fileInput.type = 'file'
		fileInput.classList.add('data-upload')
		fileInput.onchange = () => {
			if (!fileInput.files || fileInput.files.length <= 0) return
			this.loadFile(fileInput.files[0])
		}
		elm.appendChild(fileInput)
		const desc = document.createElement('div')
		desc.classList.add('data-upload')
		elm.appendChild(desc)
		desc.append('You can upload Text/Image/CSV files.')
		const subdesc = document.createElement('div')
		desc.appendChild(subdesc)
		subdesc.classList.add('sub-menu', 'data-upload')

		for (const txt of [
			'CSV: A header in the first line and a target variable in the last column.',
			'JSON: Array of objects.',
			'Text: Plain text or PDF.',
			'Image: JPEG, PNG, BMP, GIF etc.',
			'Audio: Audio data.',
		]) {
			const d = document.createElement('div')
			d.innerText = txt
			d.style.fontSize = '80%'
			d.classList.add('data-upload')
			subdesc.appendChild(d)
		}
	}

	get availTask() {
		if (this._filetype === 'image') {
			return ['SG', 'DN', 'ED']
		} else if (this._filetype === 'audio') {
			return ['SM']
		} else if (this._filetype === 'text') {
			return ['WE']
		} else {
			return ['CF', 'RG', 'AD', 'DR', 'FS']
		}
	}

	loadFile(file) {
		this._file = file
		this._filetype = null
		if (file.type.startsWith('image/')) {
			this._filetype = 'image'
		} else if (file.type.startsWith('audio/')) {
			this._filetype = 'audio'
		} else if (file.type.startsWith('video/')) {
			this._filetype = 'video'
		} else if (file.type === 'application/pdf') {
			this._filetype = 'text'
		} else if (file.type === 'text/plain') {
			this._filetype = 'text'
		} else if (file.type === 'text/csv') {
			this._filetype = 'csv'
		} else if (file.type === 'application/json') {
			this._filetype = 'json'
		} else if (file.type === '') {
			this._filetype = 'csv'
		} else {
			throw 'Unknown file type: ' + file.type
		}
		this.setting.data.configElement.querySelectorAll(':not(.data-upload)').forEach(e => e.remove())
		this._manager.platform._renderer.terminate()

		if (this._filetype === 'image') {
			UploadData.prototype.__proto__ = ImageData.prototype
			UploadData.__proto__ = ImageData
			this.readImage(file).then(data => {
				this._x = [data]
				this._y = [0]
				this._manager.platform.render && this._manager.platform.render()
			})
		} else if (this._filetype === 'audio' || this._filetype === 'video') {
			UploadData.prototype.__proto__ = AudioData.prototype
			UploadData.__proto__ = AudioData
			this.readAudio(file).then(buf => {
				this._x = Array.from(buf.getChannelData(0)).map(v => [v])
				this._y = Array(this._x.length).fill(0)
				this._manager.platform.render && this._manager.platform.render()
			})
		} else if (this._filetype === 'text') {
			UploadData.prototype.__proto__ = DocumentData.prototype
			UploadData.__proto__ = DocumentData
			this.readDocument(file).then(data => {
				this._x = [this.segment(data)]
				this._y = [0]
				this._manager.platform.render && this._manager.platform.render()
			})
		} else if (this._filetype === 'json') {
			UploadData.prototype.__proto__ = JSONData.prototype
			UploadData.__proto__ = JSONData
			this.setJSON(file)
		} else {
			UploadData.prototype.__proto__ = CSVData.prototype
			UploadData.__proto__ = CSVData
			this.setCSV(file, null, true)
		}
		this.setting.ml.refresh()
		this.setting.vue.mlTask = ''
		this.setting.vue.$forceUpdate()
	}
}
