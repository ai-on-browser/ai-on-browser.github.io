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

		this.init();
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
		const [tiles, plot] = this.datas.predict(step)
		cb(tiles, pred => {
			if (this._task === 'AD') {
				pred = pred.map(v => v ? specialCategory.error : specialCategory.errorRate(0))
			}
			plot(pred, this._r_tile)
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
	}

	terminate() {
		this._r.remove();
		this.svg.selectAll("g").style("visibility", null);
		const elm = this.setting.task.configElement
		elm.selectAll("*").remove()
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

	setTask(task, cb) {
		if (this._task === task) {
			this._platform.init()
			cb && cb()
			return
		}
		this._platform.terminate()
		this._task = task
		let filename = ''
		if (this._task === 'MD' || this._task === 'GM') {
			filename = './rl.js'
		} else if (this._task === 'TP' || this._task === 'SM' || this._task === 'CP') {
			filename = './series.js'
		}

		const loadPlatform = (platformClass) => {
			if (task === 'MD' || task === 'GM') {
				new platformClass(task, this, (env) => {
					this._platform = env
					if (!this._setting.ml.modelName) env.render()
					cb && cb()
				});
				return
			}
			this._platform = new platformClass(task, this)
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

