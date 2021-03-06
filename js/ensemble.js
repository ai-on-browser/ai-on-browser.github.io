class OneVsAllModel { // one vs all
	constructor(model, classes, init_args) {
		if (!Array.isArray(classes)) {
			classes = [...classes]
		}
		this._classes = classes;
		this._model = [];
		this._n = classes.length;
		init_args = init_args || []
		for (let i = 0; i < this._n; i++) {
			this._model[i] = new model(...init_args);
		}
	}

	init(train_x, train_y) {
		for (let i = 0; i < this._n; i++) {
			let dy = train_y.map(c => (c === this._classes[i]) ? 1 : -1);
			this._model[i].init(train_x, dy);
		}
	}

	fit() {
		for (let i = 0; i < this._n; i++) {
			this._model[i].fit();
		}
	}

	predict(data) {
		let pred = [];
		for (let i = 0; i < data.length; i++) {
			pred[i] = [];
		}
		for (let i = 0; i < this._n; i++) {
			this._model[i].predict(data).map((v, k) => {
				pred[k][i] = v;
			});
		}
		return pred.map(p => this._classes[argmax(p)]);
	}
}

class OneVsOneModel { // one vs one
	constructor(model, classes, init_args) {
		if (!Array.isArray(classes)) {
			classes = [...classes]
		}
		this._classes = classes;
		this._model = [];
		this._n = classes.length;
		init_args = init_args || []
		for (let i = 0; i < this._n; i++) {
			this._model[i] = [];
			for (let j = 0; j < i; j++) {
				this._model[i][j] = new model(...init_args);
			}
		}
	}

	init(train_x, train_y) {
		let d = {};
		train_y.forEach((c, i) => {
			if (!d[c]) d[c] = [];
			d[c].push(train_x[i]);
		});
		let lbl = [];
		for (let i = 0; i < this._n; i++) {
			lbl[i] = Array(d[this._classes[i]].length).fill(1);
			for (let j = 0; j < i; j++) {
				let dx = d[this._classes[i]].concat(d[this._classes[j]]);
				let dy = lbl[i].concat(lbl[j]);
				this._model[i][j].init(dx, dy);
			}
			lbl[i].fill(-1);
		}
	}

	fit() {
		for (let i = 0; i < this._n; i++) {
			for (let j = 0; j < i; j++) {
				this._model[i][j].fit();
			}
		}
	}

	predict(data) {
		let pred = [];
		for (let i = 0; i < data.length; i++) {
			pred.push(Array(this._n).fill(0));
		}
		for (let i = 0; i < this._n; i++) {
			for (let j = 0; j < i; j++) {
				this._model[i][j].predict(data).map((v, k) => {
					pred[k][(v > 0) ? i : j]++;
				});
			}
		}
		return pred.map(p => this._classes[argmax(p)]);
	}
}

