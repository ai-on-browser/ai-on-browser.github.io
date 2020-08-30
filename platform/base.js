import FittingMode from '../js/fitting.js'

import datas from '../data/base.js'

export class BasePlatform {
	constructor(task, setting) {
		this._setting = setting
		this._svg = setting.svg
		this._task = task
	}

	get task() {
		return this._task
	}

	get setting() {
		return this._setting
	}

	get svg() {
		return this._svg;
	}

	get width() {
		return this._svg.node().getBoundingClientRect().width;
	}

	get height() {
		return this._svg.node().getBoundingClientRect().height;
	}

	get datas() {
		return datas
	}

	close() {}
}

class DefaultPlatform extends BasePlatform {
	constructor(task, setting) {
		super(task, setting);

		this.init();
	}

	plot(fit_cb, step = null, scale = 1000) {
		const func = (this._task === 'RG') ? FittingMode.RG(this._setting.dimension) : FittingMode[this._task]
		if (this._cur_dimension !== this._setting.dimension) {
			this.init()
		}
		return func.fit(this._r, this.datas, step, fit_cb, scale)
	}

	init() {
		this._r && this._r.remove()
		this._cur_dimension = this._setting.dimension
		if (this._task === 'RG') {
			if (this._setting.dimension === 1) {
				this._r = this._svg.append("g");
			} else {
				this._r = this._svg.insert("g", ":first-child");
			}
		} else {
			this._r = this._svg.insert("g", ":first-child");
		}
		this._r.classed("default-render", true);
	}

	clean() {
		this._r.remove();
		this._svg.selectAll("g").style("visibility", null);
	}

	close() {
		this.clean();
	}
}

const loadedPlatform = {}

export default class PlatformManager {
	constructor(setting) {
		this._platform = new DefaultPlatform(null, setting)
		this._setting = setting
		this._svg = setting.svg
		this._task = ''
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
		return datas
	}

	setTask(value, cb) {
		this._platform.close()
		this._task = value
		let filename = null
		if (this._task === 'MD') {
			filename = './rl.js'
		} else if (this._task === 'TP' || this._task === 'SM' || this._task === 'CP') {
			filename = './series.js'
		} else {
			this._platform = new DefaultPlatform(this._task, this._setting)
			cb && cb()
			return
		}

		const task = this._task
		const loadPlatform = (platformClass) => {
			if (task === 'MD') {
				new platformClass(task, this._setting, (env) => {
					this._platform = env
					if (!this._setting.ml.modelName) env.render()
					cb && cb()
				});
				return
			}
			this._platform = new platformClass(task, this._setting)
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
}

