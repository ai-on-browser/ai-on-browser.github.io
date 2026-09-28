import { BaseData, FixData } from './base.js'
import AudioLoader from './loader/audio.js'
import CSV from './loader/csv.js'
import DocumentLoader from './loader/document.js'
import ImageLoader from './loader/image.js'
import JSONLoader from './loader/json.js'
import IOSelector from './util/ioselector.js'

export default class UploadData extends BaseData {
	constructor(manager) {
		super(manager)
		this._targetHandler = null
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

	get columnNames() {
		if (this._selector) {
			return this._selector.objectNames
		}
		return this._targetHandler?.columnNames ?? super.columnNames
	}

	get x() {
		const x = this._targetHandler?.x ?? super.x
		if (this._selector) {
			return x.map(v => this._selector.object.map(i => v[i]))
		}
		return x
	}

	get originalX() {
		const x = this._targetHandler?.originalX ?? super.originalX
		if (this._selector) {
			return x.map(v => this._selector.object.map(i => v[i]))
		}
		return x
	}

	get y() {
		if (this._selector) {
			const x = this._targetHandler?.x ?? super.x
			return x.map(v => v[this._selector.target])
		}
		return this._targetHandler?.y ?? super.y
	}

	get originalY() {
		if (this._selector) {
			const x = this._targetHandler?.originalX ?? super.originalX
			return x.map(v => v[this._selector.target])
		}
		return this._targetHandler?.originalY ?? super.originalY
	}

	get index() {
		return this._targetHandler?.index ?? super.index
	}

	get labels() {
		return this._targetHandler?.labels ?? super.labels
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
			throw `Unknown file type: ${file.type}`
		}
		for (const e of this.setting.data.configElement.querySelectorAll(':not(.data-upload)')) {
			e.remove()
		}
		if (this._manager.task) {
			for (const rend of this._manager.platform._renderer) {
				rend.terminate()
			}
		}
		this._targetHandler?.terminate()
		this._targetHandler = null
		this._selector?.terminate()
		this._selector = null

		if (this._filetype === 'image') {
			this._targetHandler = null
			const data = await ImageLoader.load(file)
			this._x = [data]
			this._y = [0]
		} else if (this._filetype === 'audio' || this._filetype === 'video') {
			this._targetHandler = null
			const buf = await AudioLoader.load(file)
			this._x = Array.from(buf.getChannelData(0)).map(v => [v])
			this._y = Array(this._x.length).fill(0)
		} else if (this._filetype === 'text') {
			this._targetHandler = null
			const data = await DocumentLoader.load(file)
			this._x = [DocumentLoader.segment(data)]
			this._y = [0]
		} else if (this._filetype === 'json') {
			this._targetHandler = new FixData(this._manager)
			const json = await JSONLoader.load(file)
			const info = json.info
			info[info.length - 1].out = false
			this._targetHandler.setArray(json.data, info)
			this._selector = new IOSelector(this.setting.data.configElement)
		} else {
			this._targetHandler = new FixData(this._manager)
			const csv = await CSV.load(file, { header: 1 })
			const info = csv.info
			info[info.length - 1].out = false
			this._targetHandler.setArray(csv.data, info)
			this._selector = new IOSelector(this.setting.data.configElement)
		}
		if (this._selector) {
			const columnNames = this._targetHandler?.columnNames ?? super.columnNames
			this._selector.onchange = () => {
				this._targetHandler._domain = null
				this._manager.onReady(() => {
					this._manager.platform.init()
				})
			}
			this._selector.columns = columnNames
			this._selector.object = Array.from({ length: columnNames.length - 1 }, (_, i) => i)
			this._selector.target = columnNames.length - 1
		}
		this.setting.ml.refresh()
		this._manager.setTask('')
		this.setting.$forceUpdate()
	}
}
