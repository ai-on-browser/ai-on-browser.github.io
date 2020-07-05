importScripts('../js/math.js');

self.model = null;

self.addEventListener('message', function(e) {
	const data = e.data;
	if (data.mode == 'init') {
		self.model = new LogisticRegression(data.classes);
	} else if (data.mode == 'fit') {
		self.model.fit(data.x, data.y, data.iteration, data.rate);
		self.postMessage(null);
	} else if (data.mode == 'predict') {
		self.postMessage(self.model.predict(data.x));
	}
}, false);

class LogisticRegression {
	// see http://darden.hatenablog.com/entry/2018/01/27/000544
	constructor(classes) {
		this._features = 2;
		this._classes = classes;
		this._W = Matrix.randn(this._features, this._classes);
		this._b = Matrix.randn(1, this._classes);
	}

	_output(x) {
		let a = x.dot(this._W);
		a.add(this._b);

		MathFunction.softmax(a);
		return a;
	}

	fit(train_x, train_y, iteration = 1, rate = 0.1) {
		const samples = train_x.length;

		const x = new Matrix(samples, 2, train_x);
		const y = new Matrix(samples, this._classes);
		train_y.forEach((t, i) => y.set(i, t[0], 1));

		for (let n = 0; n < iteration; n++) {
			let phi = this._output(x);
			phi.sub(y);

			let dw = x.tDot(phi);
			dw.mult(-rate / samples);

			let db = phi.sum(0);
			db.mult(-rate / samples);

			this._W.add(dw);
			this._b.add(db);
		}
	}

	predict(points) {
		const x = new Matrix(points.length, 2, points);

		const samples = points.length;
		let a = x.dot(this._W);
		a.add(this._b);

		return a.argmax(1).value;
	}
}

