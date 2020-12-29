import { MultiDimensionalData } from './base.js'

export default class SwissRollData extends MultiDimensionalData {
	// https://blog.albert2005.co.jp/2014/12/11/%E9%AB%98%E6%AC%A1%E5%85%83%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E5%8F%AF%E8%A6%96%E5%8C%96%E3%81%AE%E6%89%8B%E6%B3%95%E3%82%92swiss-roll%E3%82%92%E4%BE%8B%E3%81%AB%E8%A6%8B%E3%81%A6%E3%81%BF%E3%82%88/
	constructor(setting, r) {
		super(setting, r)
		const n = 1000
		const p = []
		const y = []
		for (let i = 0; i < n; i++) {
			p[i] = Math.sqrt(2 + 2 * (-1 + i * 2 / n))
			y[i] = Math.random() * 4 - 2
		}
		this._x = p.map((v, i) => [v * Math.cos(2 * Math.PI * v), y[i], v * Math.sin(2 * Math.PI * v)])
		this._y = y.map((v, i) => i / 100)

		this._make_selector(['x', 'y', 'z'])
	}

	get availTask() {
		return ['RG', 'DR', 'FS']
	}

	get domain() {
		return [
			[-2, 2],
			[-2, 2],
			[-2, 2]
		]
	}
}

