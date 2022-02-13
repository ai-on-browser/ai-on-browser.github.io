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
		const fileInput = elm
			.append('input')
			.attr('type', 'file')
			.classed('data-upload', true)
			.on('change', () => {
				if (!fileInput.files || fileInput.files.length <= 0) return
				this.loadFile(fileInput.files[0])
			})
			.node()
		elm.append('div').text('You can upload Text/Image/CSV files.').classed('data-upload', true)
		const desc = elm.append('div').classed('sub-menu', true).classed('data-upload', true)
		desc.append('div')
			.text('CSV: A header in the first line and a target variable in the last column.')
			.classed('data-upload', true)
		desc.append('div').text('JSON: Array of objects.').classed('data-upload', true)
		desc.append('div').text('Text: Plain text or PDF.').classed('data-upload', true)
		desc.append('div').text('Image: JPEG, PNG, BMP, GIF etc.').classed('data-upload', true)
		desc.append('div').text('Audio: Audio data.').classed('data-upload', true)
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
		this.setting.data.configElement.selectAll(':not(.data-upload)').remove()
		this._manager.platform._renderer.terminate()

		if (this._filetype === 'image') {
			UploadData.prototype.__proto__ = ImageData.prototype
			UploadData.__proto__ = ImageData
			this.readImage(file, data => {
				this._x = [data]
				this._y = [0]
				this._manager.platform.render && this._manager.platform.render()
			})
		} else if (this._filetype === 'audio' || this._filetype === 'video') {
			UploadData.prototype.__proto__ = AudioData.prototype
			UploadData.__proto__ = AudioData
			this.readAudio(file, (data, buf) => {
				this._x = data.map(v => [v])
				this._y = Array(this._x.length).fill(0)
				this._manager.platform.render && this._manager.platform.render()
			})
		} else if (this._filetype === 'text') {
			UploadData.prototype.__proto__ = DocumentData.prototype
			UploadData.__proto__ = DocumentData
			this.readDocument(file, data => {
				this._x = [data]
				this._y = [0]
				this._manager.platform.render && this._manager.platform.render()
			})
		} else if (this._filetype === 'json') {
			UploadData.prototype.__proto__ = JSONData.prototype
			UploadData.__proto__ = JSONData
			this._input_category_names = []
			this._output_category_names = []
			this.setJSON(file)
		} else {
			UploadData.prototype.__proto__ = CSVData.prototype
			UploadData.__proto__ = CSVData
			this._input_category_names = []
			this._output_category_names = []
			this.setCSV(file, null, true)
		}
		this.setting.ml.refresh()
		this.setting.vue.mlTask = ''
		this.setting.vue.$forceUpdate()
	}
}
