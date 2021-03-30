import { BasePlatform } from './base.js'

export default class ImagePlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)

		this._reduce_algorithm = "mean"
		this._color_space = "rgb"
		this._normalize = false

		this._org_width = null
		this._org_height = null

		this._binary_threshold = 180

		const elm = this.setting.task.configElement
		elm.append("span").text("Color space")
		const cselm = elm.append("select")
			.attr("name", "space")
			.on("change", () => {
				this._color_space = cselm.property("value")
				threshold.style("display", this._color_space === "binary" ? null : "none")
				this.render()
			})
		cselm.selectAll("option")
			.data(["rgb", "gray", "binary", "hls", "hsv"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
		const threshold = elm.append("input")
			.attr("name", "threshold")
			.attr("type", "number")
			.attr("min", 0)
			.attr("max", 255)
			.attr("value", this._binary_threshold)
			.style("display", "none")
			.on("change", () => {
				this._binary_threshold = threshold.property("value")
				this.render()
			})
	}

	set colorSpace(value) {
		this._color_space = value
		this.setting.task.configElement.select("[name=space]").property("value", value)
		this.setting.task.configElement.select("[name=threshold]").style("display", this._color_space === "binary" ? null : "none")
		this.render()
	}

	init() {
		if (this.svg.select("g.im-render").size() === 0) {
			this.svg.append("g").classed("im-render", true)
				.style("transform", "scale(1, -1) translate(0, -100%)")
		}
		this._r = this.svg.select("g.im-render");
		this._r.selectAll("*").remove();

		this.render()
	}

	render() {
		let imelm = this._r.select("g.target-image")
		if (imelm.size() === 0) {
			imelm = this._r.insert("g", ":first-child")
				.classed("target-image", true)
		}

		if (!this.datas || !this.datas.x || !Array.isArray(this.datas.x[0]) || !Array.isArray(this.datas.x[0][0])) {
			return
		}

		const data = this.datas.x[0]
		const x = this._applySpace(data)
		const d = x[0][0].length

		const canvas = document.createElement("canvas")
		canvas.width = data[0].length
		canvas.height = data.length
		const context = canvas.getContext('2d')
		for (let i = 0; i < canvas.height; i++) {
			for (let j = 0; j < canvas.width; j++) {
				if (d === 1) {
					context.fillStyle = `rgb(${x[i][j][0]}, ${x[i][j][0]}, ${x[i][j][0]})`
				} else if (d === 3) {
					context.fillStyle = `rgb(${x[i][j][0]}, ${x[i][j][1]}, ${x[i][j][2]})`
				} else {
					context.fillStyle = `rgba(${x[i][j][0]}, ${x[i][j][1]}, ${x[i][j][2]}, ${x[i][j][3] / 255})`
				}
				context.fillRect(j, i, 1, 1)
			}
		}

		imelm.selectAll("*").remove()
		imelm.append("image")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", canvas.width)
			.attr("height", canvas.height)
			.attr("xlink:href", canvas.toDataURL())

		if (!this._org_width) {
			this._org_width = this._manager.platform.width
			this._org_height = this._manager.platform.height
		}

		this._manager.platform.width = canvas.width
		this._manager.platform.height = canvas.height
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
		} else if (this._color_space === "binary") {
			let v = 0.2126 * r + 0.7152 * g + 0.0722 * b
			if (v < this._binary_threshold) {
				v = 0
			} else {
				v = 255
			}
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
		const cp = []
		for (let i = 0; i < data.length; i++) {
			cp[i] = []
			for (let j = 0; j < data[i].length; j++) {
				cp[i][j] = this._convertSpace(data[i][j])
			}
		}
		return cp
	}

	fit(fit_cb, scale, step = 8) {
		const data = this.datas.x[0]
		const x = this._applySpace(this._reduce(data, step))
		fit_cb(x, null, (pred) => {
			this._pred = pred;
			this._displayResult(x, pred, step)
		})
	}

	predict(pred_cb, step = 8) {
		const data = this.datas.x[0]
		const x = this._reduce(data, step)
		if (this.task === "DN") {
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					for (let k = 0; k < x[i][j].length; k++) {
						x[i][j][k] = Math.max(0, Math.min(255, x[i][j][k] + Math.floor(Math.random() * 510 - 255)))
					}
				}
			}
		}
		pred_cb(this._applySpace(x), pred => {
			this._pred = pred;
			this._displayResult(x, pred, step)
		})
	}

	_displayResult(org, data, step) {
		this._r.select("image.predict-img").remove()

		let canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;
		let ctx = canvas.getContext("2d");
		for (let i = 0, p = 0; i < org.length; i++) {
			for (let j = 0; j < org[i].length; j++, p++) {
				ctx.fillStyle = getCategoryColor(data[p]);
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
			.classed("predict-img", true)
	}

	terminate() {
		this._r.remove();
		this.setting.task.configElement.selectAll("*").remove()
		if (this._org_width) {
			this._manager.platform.width = this._org_width
			this._manager.platform.height = this._org_height
		}
	}
}
