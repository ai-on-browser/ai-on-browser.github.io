class Word2VecWorker extends BaseWorker {
	constructor() {
		super('model/worker/neuralnetwork_worker.js');
	}

	initialize(layers, optimizer, cb) {
		this._postMessage({
			mode: "init",
			layers: layers,
			loss: "mse",
			optimizer: optimizer
		}, cb);
	}

	fit(id, train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage({
			id: id,
			mode: "fit",
			x: train_x,
			y: train_y,
			iteration: iteration,
			batch_size: batch,
			rate: rate
		}, cb);
	}

	predict(id, x, out, cb) {
		this._postMessage({
			id: id,
			mode: "predict",
			x: x,
			out: out
		}, cb);
	}

	remove(id) {
		this._postMessage({
			id: id,
			mode: "close"
		})
	}
}

class Word2Vec {
	// https://qiita.com/g-k/items/69afa87c73654af49d36
	constructor(method, n) {
		this._model = new Word2VecWorker()
		this._words = [null]
		this._wordsIdx = {}
		this._wordsNumber = null
		this._n = n
		this._method = method
	}

	get epoch() {
		return this._epoch
	}

	terminate() {
		this._model.terminate()
	}

	initialize(wordsOrNumber, reduce_size, optimizer) {
		if (this._id) {
			this._model.remove(this._id)
		}
		if (Array.isArray(wordsOrNumber)) {
			this._words = [null, ...new Set(wordsOrNumber)]
			this._wordsNumber = this._words.length
			for (let i = 1; i < this._wordsNumber; i++) {
				this._wordsIdx[this._words[i]] = i
			}
		} else {
			this._wordsNumber = wordsOrNumber
		}
		this._layers = [{type: 'input', name: 'in'}]
		this._layers.push({
			type: 'full',
			out_size: reduce_size,
			name: 'reduce'
		})
		this._layers.push({
			type: 'full',
			out_size: this._wordsNumber
		})

		this._model.initialize(this._layers, optimizer, (e) => {
			this._id = e.data
		})
	}

	terminate() {
		this._model.remove(this._id)
		this._model.terminate()
	}

	fit(words, iteration, rate, batch, cb) {
		const idxs = []
		for (const word of words) {
			if (this._wordsIdx.hasOwnProperty(word)) {
				idxs.push(this._wordsIdx[word])
			} else if (this._wordsNumber <= this._words.length) {
				idxs.push(0)
			} else {
				this._words.push(word)
				idxs.push(this._wordsIdx[word] = this._words.length - 1)
			}
		}
		const x = []
		const y = []
		if (this._method === "CBOW") {
			for (let i = 0; i < idxs.length; i++) {
				const xi = Array(this._wordsNumber).fill(0)
				const yi = Array(this._wordsNumber).fill(0)
				for (let k = 1; k <= this._n; k++) {
					if (i - k >= 0) {
						xi[idxs[i - k]]++
					}
					if (i + k < idxs.length) {
						xi[idxs[i + k]]++
					}
				}
				yi[idxs[i]] = 1
				x.push(xi)
				y.push(yi)
			}
		} else {
			for (let i = 0; i < idxs.length; i++) {
				const xi = Array(this._wordsNumber).fill(0)
				xi[idxs[i]] = 1
				for (let k = 1; k <= this._n; k++) {
					if (i - k >= 0) {
						const yi = Array(this._wordsNumber).fill(0)
						yi[idxs[i - k]] = 1
						x.push(xi)
						y.push(yi)
					}
					if (i + k < idxs.length) {
						const yi = Array(this._wordsNumber).fill(0)
						yi[idxs[i + k]] = 1
						x.push(xi)
						y.push(yi)
					}
				}
			}
		}
		this._model.fit(this._id, x, y, iteration, rate, batch, e => {
			this._epoch = e.data.epoch
			cb && cb(e)
		})
	}

	predict(x, cb) {
		const tx = []
		for (const word of x) {
			const v = Array(this._wordsNumber).fill(0)
			if (this._wordsIdx.hasOwnProperty(word)) {
				v[this._wordsIdx[word]] = 1
			} else {
				v[0] = 1
			}
			tx.push(v)
		}
		this._model.predict(this._id, tx, null, cb)
	}

	reduce(x, cb) {
		const tx = []
		for (const word of x) {
			const v = Array(this._wordsNumber).fill(0)
			if (this._wordsIdx.hasOwnProperty(word)) {
				v[this._wordsIdx[word]] = 1
			} else {
				v[0] = 1
			}
			tx.push(v)
		}
		this._model.predict(this._id, tx, ['reduce'], e => {
			cb && cb(e.data['reduce'])
		})
	}
}

var dispW2V = function(elm, platform) {
	let model = new Word2Vec()
	const fitModel = cb => {
		const iteration = +elm.select("[name=iteration]").property("value")
		const batch = +elm.select("[name=batch]").property("value")
		const rate = +elm.select("[name=rate]").property("value")

		platform.fit((tx, ty) => {
			model.fit(tx, iteration, rate, batch, (e) => {
				platform.predict((px, pred_cb) => {
					model.reduce(px, (e) => {
						pred_cb(e);
						cb && cb();
					});
				})
			});
		});
	}

	elm.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["CBOW", "skip-gram"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" n ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "n")
		.attr("min", 1)
		.attr("max", 10)
		.attr("value", 1)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.init()
		if (platform.datas.length == 0) {
			return;
		}
		if (model) {
			model.terminate()
		}
		const method = elm.select("[name=method]").property("value")
		const n = +elm.select("[name=n]").property("value")
		model = new Word2Vec(method, n)
		const rdim = 2

		platform.fit((tx, ty) => {
			model.initialize(tx, rdim, "adam");
		})
	});
	elm.append("span")
		.text(" Iteration ");
	elm.append("select")
		.attr("name", "iteration")
		.selectAll("option")
		.data([1, 10, 100, 1000, 10000])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" Learning rate ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "rate")
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.01)
		.attr("value", 0.001)
	elm.append("span")
		.text(" Batch size ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "batch")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.attr("step", 1);
	slbConf.step(fitModel).epoch(() => model.epoch)

	return () => {
		model.terminate();
	};
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispW2V(platform.setting.ml.configElement, platform);
}
