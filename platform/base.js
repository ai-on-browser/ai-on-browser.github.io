import FittingMode from '../js/fitting.js'

import ManualData from '../data/base.js'

export class BasePlatform {
	constructor(task, manager) {
		this._manager = manager
		this._task = task
	}

	get task() {
		return this._task
	}

	get setting() {
		return this._manager.setting
	}

	get svg() {
		return this._manager.setting.svg;
	}

	get width() {
		return d3.select("#plot-area svg").node().getBoundingClientRect().width
	}

	set width(value) {
		d3.select("#plot-area").style("width", (value - 2) + "px")
	}

	get height() {
		return d3.select("#plot-area svg").node().getBoundingClientRect().height
	}

	set height(value) {
		d3.select("#plot-area").style("height", (value - 2) + "px")
	}

	get datas() {
		return this._manager._datas
	}

	get params() {
		return {}
	}

	set params(params) {}

	terminate() {}
}

class DefaultPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager);

		const elm = this.setting.task.configElement
		if (this._task === 'DR' || this._task === 'FS') {
			elm.append("span").text("Target dimension")
			elm.append("input")
				.attr("type", "number")
				.attr("min", 1)
				.attr("max", 2)
				.attr("value", 2)
				.attr("name", "dimension")
		}
	}

	get dimension() {
		const elm = this.setting.task.configElement
		const dim = elm.select("[name=dimension]")
		return dim.node() ? +dim.property("value") : null
	}

	fit(fit_cb, scale = 1000) {
		const func = (this._task === 'RG') ? FittingMode.RG(this.setting.dimension) : FittingMode[this._task]
		if (this._cur_dimension !== this.setting.dimension) {
			this.init()
		}
		this.datas.scale = 1 / scale
		return func.fit(this._r_task, this.datas, fit_cb)
	}

	predict(cb, step = 10, scale = 1000) {
		this.datas.scale = 1 / scale
		const [tiles, plot] = this.datas._renderer.predict(step)
		if (this._task === "CF" || this._task === "RG") {
			tiles.push(...this.datas.x)
		}
		cb(tiles, pred => {
			if (this._task === 'AD') {
				pred = pred.map(v => v ? specialCategory.error : specialCategory.errorRate(0))
			}
			if (this._task === "CF" || this._task === "RG") {
				const p = pred.slice(tiles.length - this.datas.length)
				const t = this.datas.y
				pred = pred.slice(0, tiles.length - this.datas.length)
				if (this._task === "CF") {
					let acc = 0
					for (let i = 0; i < t.length; i++) {
						if (t[i] === p[i]) {
							acc++
						}
					}
					this.setting.footer.text("Accuracy:" + (acc / t.length))
				} else if (this._task === "RG") {
					let rmse = 0
					for (let i = 0; i < t.length; i++) {
						rmse += (t[i] - p[i]) ** 2
					}
					this.setting.footer.text("RMSE:" + Math.sqrt(rmse / t.length))
				}
			}
			plot(pred, this._r_tile)
		})
	}

	evaluate(cb, scale = 1000) {
		if (this._task !== "CF" && this._task !== "RG") {
			return
		}
		this.datas.scale = 1 / scale
		cb(this.datas.x, p => {
			const t = this.datas.y
			if (this._task === "CF") {
				let acc = 0
				for (let i = 0; i < t.length; i++) {
					if (t[i] === p[i]) {
						acc++
					}
				}
				this.setting.footer.text("Accuracy:" + (acc / t.length))
			} else if (this._task === "RG") {
				let rmse = 0
				for (let i = 0; i < t.length; i++) {
					rmse += (t[i] - p[i]) ** 2
				}
				this.setting.footer.text("RMSE:" + Math.sqrt(rmse / t.length))
			}
		})
	}

	init() {
		this._r && this._r.remove()
		this._cur_dimension = this.setting.dimension
		if (this._task === 'RG') {
			if (this.setting.dimension === 1) {
				this._r = this.svg.append("g");
			} else {
				this._r = this.svg.insert("g", ":first-child");
			}
		} else {
			this._r = this.svg.insert("g", ":first-child");
		}
		this._r.classed("default-render", true);
		this._r_task = this._r.append("g").classed("tasked-render", true)
		this._r_tile = this._r.append("g").classed("tile-render", true).attr("opacity", 0.5)
		this.setting.footer.text("")
		this.svg.select("g.centroids").remove()
		this.render()
	}

	render() {
		this.datas && this.datas._renderer.render()
	}

	centroids(center, cls, {line = false, duration = 0} = {}) {
		let centroidSvg = this.svg.select("g.centroids")
		if (centroidSvg.size() === 0) {
			centroidSvg = this.svg.append("g").classed("centroids", true)
			centroidSvg.append("g").classed("c-line", true)
			this._centroids_line = []
			this._centroids = null
		}
		const existCentroids = []
		if (this._centroids) {
			this._centroids.forEach(c => {
				if (cls.indexOf(c.category) < 0) {
					c.remove()
				} else {
					existCentroids.push(c)
				}
			})
		}
		const p = this.datas._renderer.points
		for (let k = 0; k < p.length; k++) {
			if (this._centroids_line[k]?._from !== p[k] || !line) {
				this._centroids_line[k]?.remove()
				this._centroids_line[k] = null
			}
		}
		this._centroids = center.map((c, i) => {
			let dp = existCentroids.find(e => e.category === cls[i])
			if (!dp) {
				dp = new DataPoint(centroidSvg, c.map(v => v / this.datas.scale), cls[i])
				dp.plotter(DataPointStarPlotter);
			}
			if (line) {
				const p = this.datas._renderer.points
				const y = this.datas.y
				for (let k = 0; k < p.length; k++) {
					if (y[k] === cls[i]) {
						if (!this._centroids_line[k]) {
							this._centroids_line[k] = new DataLine(centroidSvg.select(".c-line"), p[k], dp)
						} else {
							this._centroids_line[k].to = dp
						}
					}
				}
			}
			return dp;
		})
		Promise.resolve().then(() => {
			this._centroids.forEach((c, i) => {
				c.move(center[i].map(v => v / this.datas.scale), duration)
			})
		})
	}

	terminate() {
		this._r && this._r.remove();
		this.svg.select("g.centroids").remove()
		this.svg.selectAll("g").style("visibility", null);
		const elm = this.setting.task.configElement
		elm.selectAll("*").remove()
		this.setting.footer.text("")
	}
}

const loadedPlatform = {
	'': DefaultPlatform
}
const loadedData = {
	'manual': ManualData
}
const loadedModel = {}

export default class AIManager {
	constructor(setting) {
		this._setting = setting
		this._platform = new DefaultPlatform(null, this)
		this._task = ''
		this._datas = new ManualData(this)
		this._dataset = "manual"
		this._modelname = ''

		this._listener = []
	}

	get platform() {
		return this._platform
	}

	get task() {
		return this._task
	}

	get setting() {
		return this._setting
	}

	get datas() {
		return this._datas
	}

	waitReady(cb) {
		if (this._platform) {
			return cb()
		}
		this._listener.push(cb)
	}

	resolveListeners() {
		for (const listener of this._listener) {
			listener()
		}
		this._listener = []
	}

	setTask(task, cb) {
		if (!this._platform) {
			cb && cb()
			return
		}
		if (this._task === task) {
			this._platform.init()
			cb && cb()
			return
		}
		this._platform.terminate()
		this._platform = null
		this._task = task
		let filename = ''
		if (this._task === 'MD' || this._task === 'GM') {
			filename = './rl.js'
		} else if (this._task === 'TP' || this._task === 'SM' || this._task === 'CP') {
			filename = './series.js'
		} else if (this._task == 'SG' || this._task == 'DN' || this._task === 'ED') {
			filename = './image.js'
		} else if (this._task === 'WE') {
			filename = './document.js'
		} else if (this._task === 'SC') {
			filename = './semisupervised.js'
		}

		const loadPlatform = (platformClass) => {
			if (task === 'MD' || task === 'GM') {
				new platformClass(task, this, (env) => {
					this._platform = env
					this._platform.init()
					if (!this._setting.ml.modelName) env.render()
					this.resolveListeners()
					cb && cb()
				});
				return
			}
			this._platform = new platformClass(task, this)
			this._platform.init()
			this.resolveListeners()
			cb && cb()
		}

		if (loadedPlatform[filename]) {
			loadPlatform(loadedPlatform[filename])
			return
		}
		import(filename).then(obj => {
			loadedPlatform[filename] = obj.default
			loadPlatform(obj.default)
		})
	}

	setData(data, cb) {
		this._datas.terminate()
		this._datas = null
		this._dataset = data

		if (loadedData[this._dataset]) {
			this._datas = new loadedData[this._dataset](this)
			this._platform && this._platform.init()
			cb && cb()
		} else {
			import(`../data/${data}.js`).then(obj => {
				this._datas = new obj.default(this)
				this._platform && this._platform.init()
				cb && cb()
				loadedData[data] = obj.default
			})
		}
	}

	setModel(model, cb) {
		this._modelname = model

		if (!loadedModel[model]) {
			import(`../model/${model}.js`).then(obj => {
				loadedModel[model] = obj.default
				obj.default(this.platform)
				cb && cb()
			})
		} else {
			loadedModel[model](this.platform)
			cb && cb()
		}
	}
}

