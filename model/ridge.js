import { BasisFunctions } from './least_square.js'

class Ridge {
	constructor(lambda = 0.1) {
		this._w = null;
		this._lambda = lambda;
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const xtx = x.tDot(x);
		for (let i = 0; i < xtx.rows; i++) {
			xtx.addAt(i, i, this._lambda)
		}

		this._w = xtx.slove(x.t).dot(y);
	}

	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._w).toArray()
	}

	importance() {
		return this._w.value
	}
}

class KernelRidge {
	constructor(lambda = 0.1, kernel = null) {
		this._w = null;
		this._x = null;
		this._lambda = lambda;
		this._kernel = kernel;
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const K = new Matrix(x.rows, x.rows);
		this._x = []
		for (let i = 0; i < x.rows; i++) {
			this._x.push(x.row(i));
			K.set(i, i, this._kernel(this._x[i], this._x[i]) + this._lambda);
			for (let j = 0; j < i; j++) {
				const v = this._kernel(this._x[i], this._x[j])
				K.set(i, j, v);
				K.set(j, i, v);
			}
		}
		this._w = K.slove(y);
	}

	predict(x) {
		x = Matrix.fromArray(x)
		const K = new Matrix(x.rows, this._x.length);
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i);
			for (let j = 0; j < this._x.length; j++) {
				const v = this._kernel(xi, this._x[j])
				K.set(i, j, v);
			}
		}
		return K.dot(this._w).toArray()
	}

	importance() {
		return this._w.value
	}
}

class RidgeClassifier {
	constructor(lambda = 0.1, kernel = null) {
		if (kernel) {
			this._model = new KernelRidge(lambda, kernel)
		} else {
			this._model = new Ridge(lambda)
		}
	}

	fit(x, y) {
		this._model.fit(x, y)
	}

	predict(data) {
		return this._model.predict(data)
	}
}

var dispRidge = function(elm, platform) {
	const task = platform.task
	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		const kernel = elm.select("[name=kernel]").property("value")
		const kernelFunc = kernel === 'gaussian' ? KernelFunction.gaussian : null;
		platform.fit((tx, ty, fit_cb) => {
			let model
			const l = +elm.select("[name=lambda]").property("value")
			if (task === 'CF') {
				const method = elm.select("[name=method]").property("value")
				model = new EnsembleBinaryModel(RidgeClassifier, method, null, [l, kernelFunc])
			} else {
				if (kernelFunc) {
					model = new KernelRidge(l, kernelFunc);
				} else {
					model = new Ridge(l);
				}
			}

			if (task === 'FS') {
				model.fit(tx, ty);
				const imp = model.importance().map((i, k) => [i, k])
				imp.sort((a, b) => b[0] - a[0])
				const tdim = platform.dimension
				const idx = imp.map(i => i[1]).slice(0, tdim)
				const x = Matrix.fromArray(tx);
				fit_cb(x.col(idx).toArray())
			} else {
				model.fit(basisFunction.apply(tx).toArray(), ty)
				platform.predict((px, pred_cb) => {
					let pred = model.predict(basisFunction.apply(px));
					pred_cb(pred);
				}, kernelFunc ? (dim === 1 ? 1 : 10) : (dim === 1 ? 100 : 4))
			}
		});
	};

	const basisFunction = new BasisFunctions(platform)
	if (task === 'CF') {
		elm.append("select")
			.attr("name", "method")
			.selectAll("option")
			.data(["oneone", "oneall"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	}
	if (task !== 'FS') {
		basisFunction.makeHtml(elm)
		elm.append("select")
			.attr("name", "kernel")
			.selectAll("option")
			.data(["no kernel", "gaussian"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	} else {
		elm.append("input")
			.attr("type", "hidden")
			.attr("name", "kernel")
			.property("value", "")
	}
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
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispRidge(platform.setting.ml.configElement, platform);
	platform.setting.ml.detail = `
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
Therefore, the optimum parameter $ \\hat{W} $ is estimated as
$$
\\hat{W} = \\left( X^T X + \\lambda I \\right)^{-1} X^T y
$$
`
}
