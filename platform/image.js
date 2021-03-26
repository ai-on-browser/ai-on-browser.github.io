import { BasePlatform } from './base.js'

export default class ImagePlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)

		this._reduce_algorithm = "mean"
		this._color_space = "rgb"
		this._normalize = false

		const elm = this.setting.task.configElement
		elm.append("span").text("Color space")
		const cselm = elm.append("select")
			.attr("name", "space")
			.on("change", () => {
				this._color_space = cselm.property("value")
			})
		cselm.selectAll("option")
			.data(["rgb", "gray", "hls", "hsv"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
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

	_reduce(im, step) {
		const x = []
		const d = im[0][0].length
		let f = null
		if (this._reduce_algorithm === "max") {
			f = Math.max
		} else if (this._reduce_algorithm === "mean") {
			f = (a, b) => a + b
		}
		for (let i = 0, p = 0; i < im.length; i += step, p++) {
			x[p] = []
			for (let j = 0, q = 0; j < im[i].length; j += step, q++) {
				const m = Array(d).fill(0)
				for (let s = 0; s < step; s++) {
					for (let t = 0; t < step; t++) {
						for (let r = 0; r < d; r++) {
							m[r] = f(m[r], im[i + s][j + t][r])
						}
					}
				}
				x[p][q] = m
				if (this._reduce_algorithm === "mean") {
					x[p][q] = m.map(v => v / (step * step))
				}
			}
		}
		return x
	}

	_convertSpace(data) {
		const [r, g, b, a] = data
		if (this._color_space === "rgb") {
			if (this._normalize) {
				return [r / 255, g / 255, b / 255]
			} else {
				return [r, g, b]
			}
		} else if (this._color_space === "gray") {
			const v = 0.2126 * r + 0.7152 * g + 0.0722 * b
			if (this._normalize) {
				return [v / 255]
			} else {
				return [v]
			}
		} else if (this._color_space === "hls") {
			const max = Math.max(r, g, b)
			const min = Math.min(r, g, b)
			let h = null
			if (max !== min) {
				if (min === b) {
					h = 60 * (g - r) / (max - min) + 60
				} else if (min === r) {
					h = 60 * (b - g) / (max - min) + 180
				} else if (min === g) {
					h = 60 * (r - b) / (max - min) + 300
				}
			}
			const l = (max + min) / 2
			const s = max - min
			if (this._normalize) {
				return [h / 360, l / 255, s / 255]
			} else {
				return [h, l, s]
			}
		} else if (this._color_space === "hsv") {
			const max = Math.max(r, g, b)
			const min = Math.min(r, g, b)
			let h = null
			if (max !== min) {
				if (min === b) {
					h = 60 * (g - r) / (max - min) + 60
				} else if (min === r) {
					h = 60 * (b - g) / (max - min) + 180
				} else if (min === g) {
					h = 60 * (r - b) / (max - min) + 300
				}
			}
			const l = max
			const s = max - min
			if (this._normalize) {
				return [h / 360, l / 255, s / 255]
			} else {
				return [h, l, s]
			}
		}
	}

	_applySpace(data) {
		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data[i].length; j++) {
				data[i][j] = this._convertSpace(data[i][j])
			}
		}
		return data
	}

	fit(fit_cb, scale, step = 8) {
		const data = this.datas.x[0]
		const x = this._applySpace(this._reduce(data, step))
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
		this.setting.task.configElement.selectAll("*").remove()
	}
}
