import { BaseData } from './base.js'

const originalData = [
	112, 118, 132, 129, 121, 135, 148, 148, 136, 119, 104, 118,
	115, 126, 141, 135, 125, 149, 170, 170, 158, 133, 114, 140,
	145, 150, 178, 163, 172, 178, 199, 199, 184, 162, 146, 166,
	171, 180, 193, 181, 183, 218, 230, 242, 209, 191, 172, 194,
	196, 196, 236, 235, 229, 243, 264, 272, 237, 211, 180, 201,
	204, 188, 235, 227, 234, 264, 302, 293, 259, 229, 203, 229,
	242, 233, 267, 269, 270, 315, 364, 347, 312, 274, 237, 278,
	284, 277, 317, 313, 318, 374, 413, 405, 355, 306, 271, 306,
	315, 301, 356, 348, 355, 422, 465, 467, 404, 347, 305, 336,
	340, 318, 362, 348, 363, 435, 491, 505, 404, 359, 310, 337,
	360, 342, 406, 396, 420, 472, 548, 559, 463, 407, 362, 405,
	417, 391, 419, 461, 472, 535, 622, 606, 508, 461, 390, 432,
]

export default class AirPassengerData extends BaseData {
	// https://github.com/FinYang/tsdl
	constructor(setting, r) {
		super(setting, r)
		const n = originalData.length
		const domain = this.domain[0]
		const width = this._manager.platform.width
		const height = this._manager.platform.height
		this._x = originalData.map((v, i) => [i * width / n])
		this._y = originalData.map(v => v)

		this._p = []
		for (let i = 0; i < n; i++) {
			this._p.push(new DataPoint(this._r, [this._x[i][0], this._convPlotY(this._y[i])], 0))
		}
	}

	get series() {
		return this._p.map(p => [p.at[1]])
	}

	get availTask() {
		return ['RG', 'IN', 'SM', 'TP', 'CP']
	}

	get domain() {
		return [[0, 1000]]
	}

	_convPlotY(v) {
		const domain = this.domain[0]
		const height = this._manager.platform.height
		return height * (v - domain[0]) / (domain[1] - domain[0])
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i],
				set: v => {
					this._x[i] = [v[0]]
					this._p[i].at = [v[0], this._convPlotY(this._y[i])]
				}
			},
			y: {
				get: () => this._y[i],
				set: v => {
					this._p[i].category = v
				}
			},
			point: {
				get: () => this._p[i]
			}
		})
	}

	predict(step) {
		if (!Array.isArray(step)) {
			step = [step, step];
		}
		const max = this.domain.map(r => r[1])
		const tiles = [];
		for (let i = 0; i < max[0] + step[0]; i += step[0]) {
			tiles.push([i]);
		}
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			const p = [];
			for (let i = 0; i < pred.length; i++) {
				p.push([i * step[0], pred[i]]);
			}

			const line = d3.line().x(d => d[0]).y(d => this._convPlotY(d[1]));
			r.append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(p));
		}
		return [tiles, plot]
	}

	terminate() {
		super.terminate()
	}
}

