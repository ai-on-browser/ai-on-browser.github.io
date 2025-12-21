import BaseRenderer from '../renderer/base.js'
import { FixData } from './base.js'
import BaseDB from './db/base.js'

// const mnistOrgLinks = {
// 	trainImages: 'http://yann.lecun.com/exdb/mnist/train-images-idx3-ubyte.gz',
// 	trainLabels: 'http://yann.lecun.com/exdb/mnist/train-labels-idx1-ubyte.gz',
// 	testImages: 'http://yann.lecun.com/exdb/mnist/t10k-images-idx3-ubyte.gz',
// 	testLabels: 'http://yann.lecun.com/exdb/mnist/t10k-labels-idx1-ubyte.gz',
// }

// tensorflow.js (tfjs-vis/demos/mnist/data.js)
const mnistLinks = {
	trainImages: 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png',
	trainLabels: 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8',
}

let lock = false

export default class MNISTData extends FixData {
	// http://yann.lecun.com/exdb/mnist/
	constructor(manager) {
		super(manager)
		this._sampleCount = 10
		this._imageSize = [28, 28]

		const elm = this.setting.data.configElement
		const flexelm = document.createElement('div')
		flexelm.style.display = 'flex'
		flexelm.style.justifyContent = 'space-between'
		elm.appendChild(flexelm)

		const sampleNumelm = document.createElement('span')
		flexelm.appendChild(sampleNumelm)
		const sampleNumber = document.createElement('input')
		sampleNumber.type = 'number'
		sampleNumber.min = 1
		sampleNumber.max = 10000
		sampleNumber.value = 10
		sampleNumber.onchange = async () => {
			this._sampleCount = +sampleNumber.value
			await this._readyData()
			this._manager.platform.init()
		}
		sampleNumelm.append('Sample number', sampleNumber)

		const txt = document.createElement('div')
		flexelm.appendChild(txt)

		const aelm = document.createElement('a')
		aelm.href = 'https://github.com/tensorflow/tfjs'
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = 'TensorFlow.js'
		txt.append('The data is from the ', aelm)

		this._manager.requiredRenderers([MNISTRenderer])
		this._readyData().then(() => {
			this._manager.onReady(() => {
				this._manager.platform.init()
			})
		})
	}

	get availTask() {
		return ['CF', 'SC', 'RL', 'AD', 'DR', 'FS']
	}

	get domain() {
		const d = []
		for (let i = 0; i < this._imageSize[0] * this._imageSize[1]; i++) {
			d.push([0, 255])
		}
		return d
	}

	get columnNames() {
		return this._cols || []
	}

	_sample(data) {
		const idxy = data.map((v, i) => [v.y, i])
		const xs = []
		const ys = []
		for (let k = 0; k <= 9; k++) {
			const fy = idxy.filter(v => v[0] === k)
			const count = Math.min(fy.length, this._sampleCount)
			const idx = Array.from({ length: count }, (_, i) => i)
			for (let i = idx.length - 1; i > 0; i--) {
				const r = Math.floor(Math.random() * (i + 1))
				;[idx[i], idx[r]] = [idx[r], idx[i]]
			}
			for (let i = 0; i < count; i++) {
				const p = fy[idx[i]][1]
				xs.push(data[p].x)
				ys.push(data[p].y)
			}
		}
		return [xs, ys]
	}

	async _readyData() {
		this._cols = []
		for (let i = 0, p = 0; i < 28; i++) {
			for (let j = 0; j < 28; j++, p++) {
				this._cols.push(`${i},${j}`)
			}
		}

		const db = new MNISTDB()
		const data = await db.list(TABLE_NAME)
		if (data.length > 0) {
			;[this._x, this._y] = this._sample(data)
			return
		}

		if (lock) {
			return
		}
		lock = true

		return new Promise((resolve, reject) => {
			const img = new Image()
			img.crossOrigin = 'Anonymous'
			img.addEventListener(
				'load',
				async () => {
					const n = img.height
					const m = img.width
					const canvas = document.createElement('canvas')
					canvas.width = m
					canvas.height = n
					const ctx = canvas.getContext('2d')
					ctx.drawImage(img, 0, 0)
					const data = ctx.getImageData(0, 0, m, n)

					const res = await fetch(mnistLinks.trainLabels)
					const buf = new Int8Array(await res.arrayBuffer())

					const storeData = []
					for (let i = 0; i < n; i++) {
						const image = []
						for (let k = 0; k < m * 4; k += 4) {
							image.push(data.data[i * m * 4 + k])
						}
						const oh = buf.slice(i * 10, (i + 1) * 10)
						storeData[i] = {
							x: image,
							y: oh.indexOf(1),
						}
					}

					db.save(TABLE_NAME, storeData)
					;[this._x, this._y] = this._sample(storeData)
					lock = false
					resolve()
				},
				false
			)
			img.addEventListener('error', reject)
			img.src = mnistLinks.trainImages
		})
	}

	terminate() {
		super.terminate()
		this._manager.requiredRenderers()
	}
}

class MNISTRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)
		this._offset = 0
		this._pagesize = 100
		this._colsize = 5

		this._predict = null

		const r = this.setting.render.addItem('mnist')
		const head = document.createElement('div')
		head.style.display = 'flex'
		head.style.justifyContent = 'space-between'
		head.style.position = 'sticky'
		head.style.top = '0'

		const nav = document.createElement('div')
		nav.style.backgroundColor = 'white'
		nav.style.padding = '5px'
		nav.style.marginBottom = '-1px'
		nav.style.borderBottom = '1px solid black'
		head.append(nav)

		this._navigator = document.createElement('span')
		nav.appendChild(this._navigator)

		const pagesize = document.createElement('select')
		pagesize.onchange = () => {
			this._offset = 0
			this._pagesize = +pagesize.value
			this._renderPager()
		}
		for (const size of [10, 50, 100, 500, 1000]) {
			const opt = document.createElement('option')
			opt.value = size
			opt.innerText = size
			pagesize.append(opt)
		}
		pagesize.value = this._pagesize
		nav.appendChild(pagesize)

		const totop = document.createElement('button')
		totop.innerHTML = '&uarr;'
		totop.onclick = () => {
			window.scroll({ top: 0, behavior: 'smooth' })
		}
		totop.title = 'To top'
		totop.style.margin = '5px'
		totop.style.borderRadius = '50%'
		head.appendChild(totop)

		this._table = document.createElement('table')
		this._table.style.border = '1px solid black'
		this._table.style.borderCollapse = 'collapse'
		r.append(head, this._table)

		this._manager.setting.render.selectItem('mnist')
	}

	set trainResult(value) {
		if (this._manager.platform.task === 'CF' && this.datas.outputCategoryNames) {
			value = value.map(v => this.datas.outputCategoryNames[v - 1])
		} else if (this._manager.platform.task === 'AD') {
			value = value.map(v => (v ? 'anomalous' : ''))
		}
		if (!this._predict) {
			this._predict = value
			this.render()
		} else {
			this._predict = value
			this._renderData()
		}
	}

	init() {
		this._predict = null
	}

	render() {
		this._table.replaceChildren()
		this._navigator.replaceChildren()
		this._offset = 0
		const data = this.datas
		if (!data) {
			return
		}

		const thead = this._table.createTHead()
		const tr = thead.insertRow()
		const cols = ['image', 'target']
		if (this._predict) {
			cols.push('predict')
		}
		for (let k = 0; k < this._colsize; k++) {
			for (const col of cols) {
				const td = tr.insertCell()
				td.innerText = col
				td.style.border = '1px solid black'
			}
		}

		this._table.createTBody()
		this._renderPager()
	}

	_renderPager() {
		this._navigator.replaceChildren()
		this._renderData()

		const data = this.datas
		if (!data) {
			return
		}

		const maxk = Math.ceil(data.length / this._pagesize)
		const curk = Math.floor(this._offset / this._pagesize) + 1

		if (curk > 1) {
			const toprev = document.createElement('input')
			toprev.type = 'button'
			toprev.value = '<'
			toprev.onclick = () => {
				this._offset = Math.max(0, this._offset - this._pagesize)
				this._renderPager()
			}
			this._navigator.appendChild(toprev)
		}

		const tofirst = document.createElement('input')
		tofirst.type = 'button'
		tofirst.value = '1'
		tofirst.onclick = () => {
			this._offset = 0
			this._renderPager()
		}
		if (curk === 1) {
			tofirst.disabled = true
		}
		this._navigator.appendChild(tofirst)
		if (curk > 3) {
			this._navigator.append(' ... ')
		}

		for (let i = Math.max(2, curk - 1); i <= Math.min(maxk - 1, curk + 1); i++) {
			const btn = document.createElement('input')
			btn.type = 'button'
			btn.value = i
			btn.onclick = () => {
				this._offset = this._pagesize * (i - 1)
				this._renderPager()
			}
			if (i === curk) {
				btn.disabled = true
			}
			this._navigator.appendChild(btn)
		}
		if (curk < maxk - 2) {
			this._navigator.append(' ... ')
		}

		if (maxk > 1) {
			const tolast = document.createElement('input')
			tolast.type = 'button'
			tolast.value = maxk
			tolast.onclick = () => {
				this._offset = this._pagesize * (maxk - 1)
				this._renderPager()
			}
			if (curk === maxk) {
				tolast.disabled = true
			}
			this._navigator.appendChild(tolast)
		}
		if (curk < maxk) {
			const tonext = document.createElement('input')
			tonext.type = 'button'
			tonext.value = '>'
			tonext.onclick = () => {
				this._offset = Math.min(data.length - 1, this._offset + this._pagesize)
				this._renderPager()
			}
			this._navigator.appendChild(tonext)
		}

		this._navigator.append(
			` (${this._offset + 1} - ${Math.min(this._offset + this._pagesize, data.length)} / ${data.length}) `
		)
	}

	_renderData() {
		const tbody = this._table.tBodies[0]
		tbody.replaceChildren()

		const data = this.datas
		if (!data) {
			return
		}

		const width = 28
		const height = 28

		const x = data.originalX
		const y = this._manager.platform.task === 'RG' ? data.y : data.originalY
		const ed = Math.min(data.length, this._offset + this._pagesize)
		for (let i = this._offset; i < ed; ) {
			const tr = tbody.insertRow()
			for (let k = 0; k < this._colsize && i < ed; k++, i++) {
				const canvas = document.createElement('canvas')
				canvas.height = width
				canvas.width = height
				const ctx = canvas.getContext('2d')
				const imgdata = ctx.getImageData(0, 0, width, height)
				for (let p = 0; p < x[i].length; p++) {
					imgdata.data[p * 4] = x[i][p]
					imgdata.data[p * 4 + 1] = x[i][p]
					imgdata.data[p * 4 + 2] = x[i][p]
					imgdata.data[p * 4 + 3] = 255
				}
				ctx.putImageData(imgdata, 0, 0)
				const td = tr.insertCell()
				td.appendChild(canvas)
				td.style.border = '1px solid black'
				td.style.textAlign = 'center'

				const vals = [y[i]]
				if (this._predict) {
					vals.push(this._predict[i])
				}
				for (const val of vals) {
					const td = tr.insertCell()
					td.innerText = val
					td.style.border = '1px solid black'
				}
			}
		}
	}

	terminate() {
		this.setting.render.removeItem('mnist')
		super.terminate()
	}
}

const DB_NAME = 'mnist'
const TABLE_NAME = 'data'

class MNISTDB extends BaseDB {
	constructor() {
		super(DB_NAME, 1)
	}

	onupgradeneeded(e) {
		const db = e.target.result

		db.createObjectStore(TABLE_NAME, { autoIncrement: true })
	}
}
