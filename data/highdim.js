import { BaseData } from './base.js'

export default class HighDimensionData extends BaseData {
	constructor(svg, r) {
		super(svg, r)
		const width = this._svg.node().getBoundingClientRect().width
		const height = this._svg.node().getBoundingClientRect().height

		const n = 200
		this._d = 10
		this._domain = [[0, width], [0, height]]
		for (let d = 2; d < this._d; d++) {
			this._domain.push([0, (width + height) / 2])
		}
		this._x = Matrix.random(n, this._d).toArray()
		this._y = []
		this._p = []
		for (let i = 0; i < n; i++) {
			for (let d = 0; d < this._d; d++) {
				this._x[i][d] *= this._domain[d][1]
			}
			this._y.push(randint(1, 4))
			this._p.push(new DataPoint(this._r, this._x[i].slice(0, 2), this._y[i]))
		}
	}

	get domain() {
		return this._domain
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i],
				set: v => {
					if (v.length !== this._d) {
						throw "Invalid dimension data."
					}
					this._x[i] = v
					this._p[i].at = v.slice(0, 2)
				}
			},
			y: {
				get: () => this._y[i],
				set: v => {
					this._y[i] = v
					this._p[i].category = v
				}
			},
			point: {
				get: () => this._p[i]
			}
		})
	}

	predict(step) {
		return [this._x, (pred, r) => {
			console.log(pred)
		}]
	}

	clean() {
		super.clean()
	}
