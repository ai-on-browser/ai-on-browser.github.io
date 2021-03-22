class LassoWorker extends BaseWorker {
	constructor(classes) {
		super('model/worker/lasso_worker.js');
	}

	initialize(in_dim, out_dim, lambda = 0.1, method = "CD") {
		this._postMessage({
			"mode": "init",
			"in_dim": in_dim,
			"out_dim": out_dim,
			"lambda": lambda,
			"method": method
		});
	}

	fit(train_x, train_y, iteration, cb) {
		this._postMessage({
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration
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

var dispLassoReg = function(elm, model, platform) {
	const step = 4;
	const task = platform.task

	return (cb) => {
		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx, ty, 1, () => {
				if (task === 'FS') {
					model.importance(e => {
						const imp = Matrix.fromArray(e.data)
						const impi = imp.value.map((i, k) => [i, k])
						impi.sort((a, b) => b[0] - a[0])
						const tdim = platform.dimension
						const idx = impi.map(i => i[1]).slice(0, tdim)
						const x = Matrix.fromArray(tx)
						pred_cb(x.col(idx).toArray())
						cb && cb()
					})
				} else {
					platform.predict((px, pred_cb) => {
						model.predict(px, (e) => {
							pred_cb(e.data);

							cb && cb();
						});
					}, step)
				}
			});
		});
	};
}

var dispLasso = function(elm, platform) {
	let model = new LassoWorker();
	const fitModel = dispLassoReg(elm, model, platform);
	let isRunning = false;
	let epoch = 0;

	elm.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["CD", "ISTA", "LARS"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("lambda = ");
	elm.append("select")
		.attr("name", "lambda")
		.selectAll("option")
		.data([0, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const dim = platform.datas.dimension;
		model.initialize(dim, 1, +elm.select("[name=lambda]").property("value"), elm.select("[name=method]").property("value"));
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
	platform.setting.terminate = dispLasso(platform.setting.ml.configElement, platform);
	platform.setting.ml.detail = `
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|_1
$$
where $ y $ is the observed value corresponding to $ X $.
`
}
