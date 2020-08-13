import FittingMode from '../js/fitting.js'

export default class DefaultPlatform {
	constructor(task, setting) {
		this._setting = setting
		this._svg = setting.svg;
		this._task = task;

		this.init();
	}

	get task() {
		return this._task;
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

	get points() {
		return this._setting.points
	}

	plot(fit_cb, step = null, scale = 1000) {
		const func = (this._task === 'RG') ? FittingMode.RG(this._setting.dimension) : FittingMode[this._task]
		if (this._cur_dimension !== this._setting.dimension) {
			this.init()
		}
		return func.fit(this._r, this._setting.points, step, fit_cb, scale)
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

