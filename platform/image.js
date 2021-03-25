import { BasePlatform } from './base.js'

export default class ImagePlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
	}

	init() {
		if (this.svg.select("g.im-render").size() === 0) {
			this.svg.append("g").classed("im-render", true)
		}
		this._r = this.svg.select("g.im-render");
		this._r.selectAll("*").remove();
	}

	render() {
	}

	fit(fit_cb, scale, step = 8) {
		const data = this.datas.x[0]
		const x = []
		const d = data[0][0].length
		for (let i = 0, p = 0; i < data.length; i += step) {
			for (let j = 0; j < data[i].length; j += step, p++) {
				const m = Array(d).fill(0)
				for (let s = 0; s < step; s++) {
					for (let t = 0; t < step; t++) {
						for (let r = 0; r < d; r++) {
							m[r] = Math.max(m[r], data[i + s][j + t][r])
						}
					}
				}
				x[p] = m
			}
		}
		fit_cb(x, null, (pred) => {
			this._pred = pred;
			this._r.selectAll("*").remove()

			let canvas = document.createElement("canvas");
			canvas.width = this.width;
			canvas.height = this.height;
			let ctx = canvas.getContext("2d");
			for (let i = 0, p = 0; i < data.length / step; i++) {
				for (let j = 0; j < data[i].length / step; j++, p++) {
					ctx.fillStyle = getCategoryColor(this._pred[p]);
					ctx.fillRect(j * step, i * step, step, step);
				}
			}
			this._r.append("image")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", canvas.width)
				.attr("height", canvas.height)
				.attr("opacity", 0.5)
				.attr("xlink:href", canvas.toDataURL())
			this._r.style("transform", `scale(1, -1) translate(0px, -${canvas.height}px)`)
		})
	}

	terminate() {
		this._r.remove();
	}
}
