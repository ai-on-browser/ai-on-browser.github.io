import { BaseData, FixData } from './base.js'
import AudioLoader from './loader/audio.js'
import DocumentLoader from './loader/document.js'
import CSV from './loader/csv.js'
import ImageLoader from './loader/image.js'
import JSONLoader from './loader/json.js'

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
		} else if (this._filetype === 'audio' || this._filetype === 'video') {
			return ['SM']
		} else if (this._filetype === 'text') {
			return ['WE']
		} else {
			return ['CF', 'RG', 'AD', 'DR', 'FS']
		}
	}

	async loadFile(file) {
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
		if (this._manager.task) {
			this._manager.platform._renderer.forEach(rend => rend.terminate())
		}

		if (this._filetype === 'image') {
			UploadData.prototype.__proto__ = BaseData.prototype
			UploadData.__proto__ = BaseData
			const data = await ImageLoader.load(file)
			this._x = [data]
			this._y = [0]
		} else if (this._filetype === 'audio' || this._filetype === 'video') {
			UploadData.prototype.__proto__ = BaseData.prototype
			UploadData.__proto__ = BaseData
			const buf = await AudioLoader.load(file)
			this._x = Array.from(buf.getChannelData(0)).map(v => [v])
			this._y = Array(this._x.length).fill(0)
		} else if (this._filetype === 'text') {
			UploadData.prototype.__proto__ = BaseData.prototype
			UploadData.__proto__ = BaseData
			const data = await DocumentLoader.load(file)
			this._x = [DocumentLoader.segment(data)]
			this._y = [0]
		} else if (this._filetype === 'json') {
			UploadData.prototype.__proto__ = FixData.prototype
			UploadData.__proto__ = FixData
			const json = await JSONLoader.load(file)
			this.setArray(json.data, json.info)
		} else {
			UploadData.prototype.__proto__ = FixData.prototype
			UploadData.__proto__ = FixData
			const csv = await CSV.load(file, { header: 1 })
			this.setArray(csv.data, csv.info)
		}
		this.setting.ml.refresh()
		this._manager.setTask('')
		this.setting.$forceUpdate()
	}
}
