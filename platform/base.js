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

	plot(fit_cb, step = null, scale = 1000) {
		const func = (this._task === 'RG') ? FittingMode.RG(this._setting.dimension) : FittingMode[this._task]
		return func(this._svg, this._setting.points, step, fit_cb, scale)
	}

	init() {
		if (this._svg.select("g.default-render").size() === 0) {
			this._svg.insert("g", ":first-child").classed("default-render", true);
		}
		this._r = this._svg.select("g.default-render");

		//const svgNode = this._svg.node();
		//this._svg.selectAll("g:not(.ts-render)").filter(function() {
		//	return this.parentNode === svgNode
		//}).style("visibility", "hidden");
	}

	clean() {
		this._r.remove();
		this._svg.selectAll("g").style("visibility", null);
	}

	close() {
		this.clean();
	}
}

