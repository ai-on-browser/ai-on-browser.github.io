class LogisticRegression {
	// see http://darden.hatenablog.com/entry/2018/01/27/000544
	constructor() {
		this._W = null
		this._b = 0
	}

	_output(x) {
		let a = x.dot(this._W);
		a.add(this._b);

		return a;
	}

	fit(x, y, iteration = 1, rate = 0.1, l1 = 0, l2 = 0) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		if (!this._W) {
			this._W = Matrix.randn(x.cols, 1)
		}
		const m = x.rows
		for (let n = 0; n < iteration; n++) {
			const phi = this._output(x)
			phi.sub(y)

			let dw = x.tDot(phi);
			dw.div(m);
			if (l1 > 0 || l2 > 0) {
				dw.map(v => v + v * l2 + Math.sign(v) * l1)
			}
			dw.mult(rate);
			this._W.sub(dw);

			let db = phi.mean()
			if (l1 > 0 || l2 > 0) {
				db += db * l2 + Math.sign(db) * l1
			}
			this._b -= db * rate
		}
	}

	predict(points) {
		const x = Matrix.fromArray(points)

		let a = x.dot(this._W);
		a.add(this._b);

		return a.value.map(v => v >= 0 ? 1 : -1)
	}
}

class MultinomialLogisticRegression {
	// see http://darden.hatenablog.com/entry/2018/01/27/000544
	constructor(classes) {
		this._classes = classes;
		this._W = null
		this._b = Matrix.randn(1, this._classes);
	}

	_output(x) {
		let a = x.dot(this._W);
		a.add(this._b);

		a.map(Math.exp);
		a.div(a.sum(1));
		return a;
	}

	fit(train_x, train_y, iteration = 1, rate = 0.1, l1 = 0, l2 = 0) {
		const samples = train_x.length;

		const x = Matrix.fromArray(train_x);
		const y = new Matrix(samples, this._classes);
		train_y.forEach((t, i) => y.set(i, t[0], 1));

		if (!this._W) {
			this._W = Matrix.randn(x.cols, this._classes);
		}

		for (let n = 0; n < iteration; n++) {
			let phi = this._output(x);
			phi.sub(y);

			const dw = x.tDot(phi);
			dw.div(samples);
			if (l1 > 0 || l2 > 0) {
				dw.map(v => v + v * l2 + Math.sign(v) * l1)
			}
			dw.mult(rate);
			this._W.sub(dw);

			const db = phi.mean(0);
			if (l1 > 0 || l2 > 0) {
				dw.map(v => v + v * l2 + Math.sign(v) * l1)
			}
			db.mult(rate);
			this._b.sub(db);
		}
	}

	predict(points) {
		const x = Matrix.fromArray(points);

		let a = x.dot(this._W);
		a.add(this._b);

		return a.argmax(1).value;
	}
}

var dispLogistic = function(elm, platform) {
	const step = 4;

	let learn_epoch = 0;
	let model = null

	const fitModel = (cb) => {
		if (!model) {
			return;
		}

		const iteration = +elm.select("[name=iteration]").property("value");
		const rate = +elm.select("[name=rate]").property("value")
		const l1 = +elm.select("[name=l1]").property("value")
		const l2 = +elm.select("[name=l2]").property("value")
		platform.fit((tx, ty) => {
			model.fit(tx, ty, iteration, rate, l1, l2)
			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred);
				learn_epoch += iteration;

				cb && cb();
			}, step);
		});
	};

	elm.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["oneone", "oneall", "multinomial"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select("[name=method]").property("value", "multinomial")
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		learn_epoch = 0;
		const method = elm.select("[name=method]").property("value")
		const model_classes = Math.max.apply(null, platform.datas.y) + 1;
		if (method === "multinomial") {
			model = new MultinomialLogisticRegression(model_classes)
		} else {
			model = new EnsembleBinaryModel(LogisticRegression, method)
		}
		platform.init()
	});
	elm.append("span")
		.text(" Iteration ");
	elm.append("select")
		.attr("name", "iteration")
		.selectAll("option")
		.data([1, 10, 100, 1000])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" Learning rate ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "rate")
		.attr("value", 0.1)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
	elm.append("span")
		.text(" l1 = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "l1")
		.attr("value", 0)
		.attr("min", 0)
		.attr("max", 10)
		.attr("step", 0.1)
	elm.append("span")
		.text(" l2 = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "l2")
		.attr("value", 0)
		.attr("min", 0)
		.attr("max", 10)
		.attr("step", 0.1)
	slbConf.step(fitModel).epoch(() => learn_epoch)
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispLogistic(platform.setting.ml.configElement, platform)
}
