import 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js'

import { FixData } from './base.js'

class CSV {
	constructor(data) {
		this._data = data
	}

	/**
	 * @type {Array<Array<string>>}
	 */
	get data() {
		return this._data
	}

	/**
	 *
	 * @param {string} str
	 * @param {*} [config]
	 * @returns {CSV}
	 */
	static parse(str, config = {}) {
		const delimiter = config.delimiter || ','
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
			} else if (str.startsWith(delimiter, p)) {
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
		return new CSV(data)
	}

	/**
	 *
	 * @param {string | File} value
	 * @param {*} [config]
	 * @returns {CSV}
	 */
	static async load(value, config = {}) {
		if (typeof value === 'string') {
			const response = await fetch(value)
			const buf = await response.arrayBuffer()
			const decoder = new TextDecoder(config.encoding || 'utf-8')
			if (value.endsWith('.gz')) {
				return CSV.parse(decoder.decode(pako.ungzip(buf)), config)
			}
			return CSV.parse(decoder.decode(buf), config)
		} else if (value instanceof File) {
			const data = await new Promise(resolve => {
				const fr = new FileReader()
				fr.onload = () => {
					resolve(fr.result)
				}
				fr.readAsText(value, config.encoding)
			})
			return CSV.parse(data, config)
		}
	}
}

export default class CSVData extends FixData {
	constructor(manager, data, columnInfos) {
		super(manager)

		if (data && columnInfos) {
			this.setCSV(data, columnInfos)
		}
	}

	async readCSV(data, config) {
		const csv = await CSV.load(data, config)
		return csv.data
	}

	setCSV(data, infos, header = false) {
		if (!Array.isArray(data)) {
			this.readCSV(data).then(d => {
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

		this.setArray(data, infos)
	}
}
