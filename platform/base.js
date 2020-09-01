import FittingMode from '../js/fitting.js'

import DataManager from '../data/base.js'

export class BasePlatform {
	constructor(task, manager) {
		this._manager = manager
		this._setting = manager.setting
		this._svg = this._setting.svg
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
		return this._manager._datas
	}

	close() {}
}

class DefaultPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager);

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

const loadedPlatform = {
	'': DefaultPlatform
}

export default class AIManager {
	constructor(setting) {
		this._setting = setting
		this._platform = new DefaultPlatform(null, this)
		this._datas = new DataManager(this)
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
		return this._datas
	}

	setTask(task, cb) {
		this._platform.close()
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
}

