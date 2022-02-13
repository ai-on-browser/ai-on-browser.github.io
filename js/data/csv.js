import { FixData } from './base.js'

class CSV {
	constructor(data, config) {
		this._data = data
		this._decoder = new TextDecoder('utf-8')
		this._config = config

		this._delimiter = this._config?.delimiter || ','
	}

	get data() {
		return this._data
	}

	async load(urlOrFile) {
		if (urlOrFile instanceof File) {
			await new Promise(resolve => {
				const fr = new FileReader()
				fr.onload = () => {
					this.loadFromString(fr.result)
					resolve()
				}
				fr.readAsText(urlOrFile)
			})
			return
		}
		this.loadFromString(await this._fetch(urlOrFile))
	}

	loadFromString(str) {
		const data = []
		let record = []
		let inStr = false
		let curValue = ''
		for (let p = 0; p < str.length; p++) {
			if (inStr) {
				if (str[p] === '"' && str[p + 1] === '"') {
					curValue += '"'
					p++
				} else if (str[p] === '"') {
					inStr = false
				} else {
					curValue += str[p]
				}
			} else if (str[p] === '"') {
				inStr = true
			} else if (str.startsWith(this._delimiter, p)) {
				record.push(curValue)
				curValue = ''
			} else if (str[p] === '\n' || str[p] === '\r') {
				if (curValue.length > 0 || record.length > 0) {
					record.push(curValue)
					data.push(record)
					curValue = ''
					record = []
				}
				if (str[p] === '\r' && str[p + 1] === '\n') {
					p++
				}
			} else {
				curValue += str[p]
			}
		}
		if (curValue.length > 0 || record.length > 0) {
			record.push(curValue)
			data.push(record)
		}
		this._data = data
	}

	async _fetch(url) {
		const response = await fetch(url)
		const reader = response.body.getReader()
		let { value: chunk, done: readerDone } = await reader.read()
		if (chunk && url.endsWith('.gz')) {
			let buf = chunk
			while (!readerDone) {
				;({ value: chunk, done: readerDone } = await reader.read())
				if (chunk) {
					const c = new Uint8Array(buf.length + chunk.length)
					c.set(buf)
					c.set(chunk, buf.length)
					buf = c
				}
			}
			chunk = pako.ungzip(buf)
		}
		chunk = chunk ? this._decoder.decode(chunk) : ''

		for (;;) {
			if (readerDone) {
				break
			}
			const remainder = chunk
			;({ value: chunk, done: readerDone } = await reader.read())
			chunk = remainder + (chunk ? this._decoder.decode(chunk) : '')
		}
		return chunk
	}
}

export default class CSVData extends FixData {
	constructor(manager, data, columnInfos) {
		super(manager)

		this._input_category_names = []
		this._output_category_names = null

		if (data && columnInfos) {
			this.setCSV(data, columnInfos)
		}
	}

	readCSV(data, configOrCb, cb) {
		const config = typeof configOrCb === 'function' ? null : configOrCb
		cb = typeof configOrCb === 'function' ? configOrCb : cb
		const csv = new CSV(null, config)
		csv.load(data).then(() => cb(csv.data))
	}

	setCSV(data, infos, header = false) {
		if (!Array.isArray(data)) {
			this.readCSV(data, d => {
				this.setCSV(d, infos, header)
			})
			return
		}
		if (header) {
			const cols = data[0]
			data = data.slice(1)
			if (!infos) {
				infos = cols.map((c, i) => {
					const cat = data.some(d => isNaN(d[i]))
					return {
						name: c,
						type: cat ? 'category' : 'numeric',
					}
				})
				infos[infos.length - 1].out = true
			}
		}

		this._x = []
		for (let i = 0; i < data.length; i++) {
			this._x[i] = []
		}
		for (let i = 0, k = 0; i < infos.length; i++) {
			if (infos[i].out) {
				this._categorical_output = infos[i].type === 'category'
				this._y = data.map(d => (isNaN(d[i]) ? d[i] : +d[i]))

				if (this._categorical_output) {
					this._output_category_names = [...new Set(this._y)]
					this._y = this._y.map(v => this._output_category_names.indexOf(v) + 1)
					if (infos[i].labels) {
						this._output_category_names[k] = this._output_category_names[k].map(v =>
							infos[i].labels.hasOwnProperty(v) ? infos[i].labels[v] : v
						)
					}
				}
			} else if (!infos[i].ignore) {
				if (infos[i].type === 'category') {
					this._input_category_names[k] = [...new Set(data.map(d => d[i]))]
					for (let j = 0; j < data.length; j++) {
						this._x[j].push(this._input_category_names[k].indexOf(data[j][i]))
					}
					if (infos[i].labels) {
						this._input_category_names[k] = this._input_category_names[k].map(v =>
							infos[i].labels.hasOwnProperty(v) ? infos[i].labels[v] : v
						)
					}
				} else {
					for (let j = 0; j < data.length; j++) {
						this._x[j].push(isNaN(data[j][i]) ? data[j][i] : +data[j][i])
					}
				}
				k++
			}
		}
		if (!this._y) {
			throw new Error("There is no 'out' column.")
		}

		this._feature_names = infos.filter(v => !v.out && !v.ignore).map(v => v.name)
		this._domain = null
		this._manager.platform._renderer._make_selector(this._feature_names)
	}
}
