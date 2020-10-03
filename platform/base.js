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
		return this.svg.node().getBoundingClientRect().width;
	}

	get height() {
		return this.svg.node().getBoundingClientRect().height;
	}

	get datas() {
		return this._manager._datas
	}

	terminate() {}
}

class DefaultPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager);

		this.init();
	}

	plot(fit_cb, step = null, scale = 1000) {
		const func = (this._task === 'RG') ? FittingMode.RG(this.setting.dimension) : FittingMode[this._task]
		if (this._cur_dimension !== this.setting.dimension) {
			this.init()
		}
		return func.fit(this._r, this.datas, step, fit_cb, scale)
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
		} else if (this._task === 'AD') {
			this._r = this.svg.append("g")
		} else {
			this._r = this.svg.insert("g", ":first-child");
		}
		this._r.classed("default-render", true);
	}

	clean() {
		this._r.remove();
		this.svg.selectAll("g").style("visibility", null);
	}

	terminate() {
		this.clean();
	}
}

const loadedPlatform = {
	'': DefaultPlatform
}

export default class AIManager {
	constructor(setting) {
		this._setting = setting
		this._platform = new DefaultPlatform(null, this)
		this._task = ''
		this._datas = new ManualData(this)
		this._dataset = "manual"
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
		this._platform.terminate()
		this._task = task
		let filename = ''
		if (this._task === 'MD') {
			filename = './rl.js'
		} else if (this._task === 'TP' || this._task === 'SM' || this._task === 'CP') {
			filename = './series.js'
		}

		const loadPlatform = (platformClass) => {
			if (task === 'MD') {
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

		if (this._dataset === "manual") {
			this._datas = new ManualData(this)
			this._platform && this._platform.init()
			cb && cb()
		} else {
			import(`../data/${data}.js`).then(obj => {
				this._datas = new obj.default(this)
				this._platform && this._platform.init()
				cb && cb()
			})
		}
	}
}

