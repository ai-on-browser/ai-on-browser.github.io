import { KMeansModel, KMeanspp } from './kmeans.js'
import { LaplacianEigenmaps } from './laplacian_eigenmaps.js'

class SpectralClustering {
	// https://mr-r-i-c-e.hatenadiary.org/entry/20121214/1355499195
	constructor(affinity = 'rbf', param = {}) {
		this._size = 0;
		this._epoch = 0;
		this._clustering = new KMeansModel();
		this._clustering.method = new KMeanspp();
		this._affinity = affinity;
		this._sigma = param.sigma || 1.0;
		this._k = param.k || 10;
	}

	get size() {
		return this._size;
	}

	get epoch() {
		return this._epoch;
	}

	init(datas, cb) {
		const n = datas.length;
		this._n = n;
		const le = new LaplacianEigenmaps(this._affinity, this._k, this._sigma, "normalized")
		this.ready = false
		le.predict(Matrix.fromArray(datas), 0, () => {
			this._ev = le._ev
			this._ev.flip(1)
			this.ready = true;
			cb && cb();
		})
	}

	add() {
		this._size++;
		this._clustering.clear();
		const s_ev = this._ev.select(null, this._n - this._size, null, this._n);
		this._s_ev = s_ev.toArray();
		for (let i = 0; i < this._size; i++) {
			this._clustering.add(this._s_ev);
		}
	}

	clear() {
		this._size = 0;
		this._epoch = 0;
		this._clustering.clear();
	}

	predict(datas) {
		return this._clustering.predict(this._s_ev);
	}

	fit(datas) {
		this._epoch++;
		return this._clustering.fit(this._s_ev);
	}
}

class SpectralClusteringPlotter {
	constructor(r, datas, affinity, param, cb) {
		this._r = r;
		this._datas = datas;
		this._model = new SpectralClustering(affinity, param);
		this._model.init(datas.x.map(p => p.map(v => v / 1000)), cb);
		this._isLoop = false;
	}

	set method(m) {
		this._model.method = m;
		this.moveCentroids();
	}

	addCentroid() {
		if (this._model.size >= this._datas.length) {
			return;
		}
		let cpoint = this._model.add(this._datas.x);
	}

	clearCentroids() {
		this._model.clear();
	}

	startLoop(cb) {
		this._isLoop = true;
		(function stepLoop(scp) {
			if (scp._isLoop) {
				scp.categorizePoints();
				scp.moveCentroids();
				cb && cb();
				setTimeout(() => stepLoop(scp), 100);
			}
		})(this);
	}

	stopLoop() {
		this._isLoop = false;
	}

	categorizePoints() {
		let pred = this._model.predict(this._datas.x);
		this._datas.forEach((value, i) =>  {
			value.y = pred[i] + 1;
		});
	}

	moveCentroids() {
		this._model.fit(this._datas.x);
	}
}

var dispSpectral = function(elm, platform) {
	const svg = platform.svg;

	let scp = null
	let isRunning = false;

	elm.append("select")
		.attr("name", "method")
		.on("change", function() {
			const value = d3.select(this).property("value")
			paramSpan.selectAll("*").style("display", "none")
			paramSpan.selectAll(`.${value}`)
				.style("display", "inline")
		})
		.selectAll("option")
		.data([
			"rbf",
			"knn",
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	const paramSpan = elm.append("span")
	paramSpan.append("span")
		.classed("rbf", true)
		.text("s =")
	paramSpan.append("input")
		.attr("type", "number")
		.attr("name", "sigma")
		.classed("rbf", true)
		.attr("min", 0.01)
		.attr("max", 100)
		.attr("step", 0.01)
		.property("value", 1)
	paramSpan.append("span")
		.classed("knn", true)
		.text("k =")
	paramSpan.append("input")
		.attr("type", "number")
		.attr("name", "k_nearest")
		.classed("knn", true)
		.attr("min", 1)
		.attr("max", 100)
		.property("value", 10)

	paramSpan.selectAll(`:not(.${elm.select("[name=method]").property("value")})`)
		.style("display", "none")

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", function() {
			const initButton = d3.select(this);
			const method = elm.select("[name=method]").property("value")
			const param = {
				sigma: +paramSpan.select("[name=sigma]").property("value"),
				k: +paramSpan.select("[name=k_nearest]").property("value")
			}
			scp = new SpectralClusteringPlotter(svg, platform.datas, method, param, () => {
				runSpan.selectAll("input").attr("disabled", null);
				initButton.attr("disabled", null)
			});
			elm.select("[name=clusternumber]")
				.text(scp._model.size);
			elm.select("[name=epoch]").text("0");
			runSpan.selectAll("input").attr("disabled", true)
			initButton.attr("disabled", true)
		});
	const runSpan = elm.append("span")
	runSpan.append("input")
		.attr("type", "button")
		.attr("value", "Add cluster")
		.on("click", () => {
			scp.addCentroid();
			scp.categorizePoints();
			elm.select("[name=clusternumber]")
				.text(scp._model.size);
		});
	runSpan.append("span")
		.attr("name", "clusternumber")
		.text("0");
	runSpan.append("span")
		.text(" clusters");
	runSpan.append("input")
		.attr("type", "button")
		.attr("value", "Clear cluster")
		.on("click", () => {
			scp.clearCentroids();
			elm.select("[name=clusternumber]").text("0");
			elm.select("[name=epoch]").text("0");
		});
	const stepButton = runSpan.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (scp._model.size == 0) {
				return;
			}
			scp.categorizePoints();
			scp.moveCentroids();
			elm.select("[name=epoch]").text(scp._model.epoch);
		});
	runSpan.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				scp.startLoop(() => {
					scp._datas = platform.datas
					elm.select("[name=epoch]").text(scp._model.epoch);
				});
			} else {
				scp.stopLoop();
			}
		});
	runSpan.append("span")
		.text(" Epoch: ");
	runSpan.append("span")
		.attr("name", "epoch")
		.text("0");
	runSpan.selectAll("input").attr("disabled", true)
	return () => {
		isRunning = false;
		if (scp) scp.stopLoop();
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Next, click "Initialize". Then, click "Add cluster". Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispSpectral(platform.setting.ml.configElement, platform)
}
