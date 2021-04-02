class ElasticNetWorker extends BaseWorker {
	constructor(classes) {
		super('model/worker/elastic_net_worker.js');
	}

	initialize(in_dim, out_dim, lambda = 0.1, alpha = 0.5) {
		this._postMessage({
			"mode": "init",
			"in_dim": in_dim,
			"out_dim": out_dim,
			"lambda": lambda,
			"alpha": alpha
		});
	}

	fit(train_x, train_y, iteration, alpha, cb) {
		this._postMessage({
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration,
			"alpha": alpha
		}, cb);
	}

	predict(x, cb) {
		this._postMessage({
			"mode": "predict",
			"x": x
		}, cb);
	}

	importance(cb) {
		this._postMessage({
			"mode": "importance"
		}, cb)
	}
}

var dispElasticNetReg = function(elm, model, platform) {
	const step = 4;
	const task = platform.task

	return (cb) => {
		platform.fit((tx, ty, fit_cb) => {
			model.fit(tx, ty, 1, +elm.select("[name=alpha]").property("value"), () => {
				if (task === 'FS') {
					model.importance(e => {
						const imp = Matrix.fromArray(e.data)
						const impi = imp.value.map((i, k) => [i, k])
						impi.sort((a, b) => b[0] - a[0])
						const tdim = platform.dimension
						const idx = impi.map(i => i[1]).slice(0, tdim)
						const x = Matrix.fromArray(tx)
						fit_cb(x.col(idx).toArray())
						cb && cb()
					})
				} else {
					platform.predict((px, pred_cb) => {
						model.predict(px, (e) => {
							pred_cb(e.data);

							platform.evaluate((x, e_cb) => {
								model.predict(x, (e) => {
									e_cb(e.data)
									cb && cb();
								})
							})
						});
					}, step)
				}
			})
		});
	};
}

var dispElasticNet = function(elm, platform) {
	let model = new ElasticNetWorker();
	const fitModel = dispElasticNetReg(elm, model, platform);
	let isRunning = false;

	elm.append("span")
		.text("lambda = ");
	elm.append("select")
		.attr("name", "lambda")
		.selectAll("option")
		.data([0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("alpha = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "alpha")
		.attr("value", 0.5)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
		.on("change", function() {
			let val = +d3.select(this).property("value");
			elm.select("[name=sp]").text(
				(val == 0) ? " ridge " :
				(val == 1) ? " lasso " :
				"");
		});
	elm.append("span")
		.attr("name", "sp");
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const dim = platform.datas.dimension;
		model.initialize(dim, 1, +elm.select("[name=lambda]").property("value"), +elm.select("[name=alpha]").property("value"));
		platform.init()
	}).step(fitModel).epoch()

	slbConf.initialize()
	return () => {
		slbConf.stop()
		model.terminate();
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispElasticNet(platform.setting.ml.configElement, platform);
	platform.setting.ml.detail = `
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\alpha \\lambda \\| W \\|_1 + (1 - \\alpha) \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
`
}
