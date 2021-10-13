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
		this._data = []
		for await (let line of this._fetch(urlOrFile)) {
			if (line.length === 0) {
				continue
			}
			const record = line.split(this._delimiter).map(value => {
				return isNaN(value) ? value : +value
			})
			this._data.push(record)
		}
	}

	loadFromString(str) {
		this._data = []
		for (let line of str.split(/\r\n?|\n/)) {
			if (line.length === 0) {
				continue
			}
			const record = line.split(this._delimiter).map(value => {
				return isNaN(value) ? value : +value
			})
			this._data.push(record)
		}
	}

	async *_fetch(url) {
		const response = await fetch(url)
		const reader = response.body.getReader()
		let { value: chunk, done: readerDone } = await reader.read()
		if (chunk && url.endsWith('.gz')) {
			let buf = chunk
			while (!readerDone) {
				({ value: chunk, done: readerDone } = await reader.read())
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

		const re = /\n|\r|\r\n/gm
		let startIndex = 0

		for (;;) {
			const result = re.exec(chunk)
			if (!result) {
				if (readerDone) {
					break
				}
				const remainder = chunk.substr(startIndex);
				({ value: chunk, done: readerDone } = await reader.read());
				chunk = remainder + (chunk ? this._decoder.decode(chunk) : '')
				startIndex = re.lastIndex = 0
				continue
			}
			yield chunk.substring(startIndex, result.index)
			startIndex = re.lastIndex
		}
		if (startIndex < chunk.length) {
			yield chunk.substr(startIndex)
		}
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
						type: cat ? 'category' : 'numeric'
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
				this._categorical_output = infos[i].type === "category"
				this._y = data.map(d => d[i])

				if (this._categorical_output) {
					this._output_category_names = [...new Set(this._y)]
					this._y = this._y.map(v => this._output_category_names.indexOf(v) + 1)
					if (infos[i].labels) {
						this._output_category_names[k] = this._output_category_names[k].map(v => infos[i].labels[v] ?? v)
					}
				}
			} else if (!infos[i].ignore) {
				if (infos[i].type === "category") {
					this._input_category_names[k] = [...new Set(data.map(d => d[i]))]
					for (let j = 0; j < data.length; j++) {
						this._x[j].push(this._input_category_names[k].indexOf(data[j][i]))
					}
					if (infos[i].labels) {
						this._input_category_names[k] = this._input_category_names[k].map(v => infos[i].labels[v] ?? v)
					}
				} else {
					for (let j = 0; j < data.length; j++) {
						this._x[j].push(data[j][i])
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
		this._renderer._make_selector(this._feature_names)
	}
}

