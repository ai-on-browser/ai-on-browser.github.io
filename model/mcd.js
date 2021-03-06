class MCD {
	// https://blog.brainpad.co.jp/entry/2018/02/19/150000
	constructor(datas, sampling_rate) {
		this._datas = datas;
		this._h = this._datas.length * sampling_rate;
		this._ext_idx = [];
		for (let i = 0; i < this._datas.length; this._ext_idx.push(i++));
		shuffle(this._ext_idx);
		this._ext_idx = this._ext_idx.slice(0, this._h);
		this._Ri = null;
		this._mean = null;
		this._std = null;
	}

	fit() {
		const n = this._datas.length;
		const dim = this._datas[0].length;
		let x = new Matrix(n, dim, this._datas);
		x = x.sliceRow(this._ext_idx);
		this._mean = x.mean(0);
		x.sub(this._mean)
		this._std = x.std(0);
		x.div(this._std)

		const R = x.cov();
		this._Ri = R.inv();

		const d = this.predict(this._datas).map((v, i) => [i, v]);
		d.sort((a, b) => a[1] - b[1]);
		this._ext_idx = d.map(v => v[0]).slice(0, this._h);
	}

	predict(data) {
		const outliers = [];
		for (let i = 0; i < data.length; i++) {
			let d = 0;
			const x = [];
			for (let j = 0; j < data[i].length; j++) {
				x[j] = (data[i][j] - this._mean.value[j]) / this._std.value[j];
			}
			for (let j = 0; j < x.length; j++) {
				for (let k = 0; k < x.length; k++) {
					d += x[k] * this._Ri.at(k, j) * x[j];
				}
			}
			outliers.push(d / 2);
		}
		return outliers;
	}
}

var dispMCD = function(elm, platform) {
	let model = null;

	const calcMCD = (cb) => {
		platform.fit((tx, ty, fit_cb) => {
			const threshold = +elm.select("[name=threshold]").property("value")
			const srate = +elm.select("[name=srate]").property("value")
			if (!model) model = new MCD(tx, srate)
			model.fit();
			const outliers = model.predict(tx).map(v => v > threshold);
			fit_cb(outliers)
			platform.predict((px, pred_cb) => {
				const outlier_tiles = model.predict(px).map(v => v > threshold);
				pred_cb(outlier_tiles)
			}, 3)
			cb && cb()
		})
	}

	elm.append("span")
		.text(" Sampling rate ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "srate")
		.property("value", 0.9)
		.attr("min", 0.1)
		.attr("max", 1)
		.attr("step", 0.1);
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 10)
		.property("required", true)
		.attr("step", 0.1)
		.on("change", calcMCD);
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null;
		calcMCD()
	}).step(calcMCD)

	return () => {
		slbConf.stop()
	};
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.terminate = dispMCD(platform.setting.ml.configElement, platform)
}
