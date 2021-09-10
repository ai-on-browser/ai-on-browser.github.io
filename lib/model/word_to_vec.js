class Word2VecWorker extends BaseWorker {
	constructor() {
		super('lib/model/worker/neuralnetwork_worker.js', { type: 'module' })
	}

	initialize(layers, optimizer, cb) {
		this._postMessage(
			{
				mode: 'init',
				layers: layers,
				loss: 'mse',
				optimizer: optimizer,
			},
			cb
		)
	}

	fit(id, train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'fit',
				x: train_x,
				y: train_y,
				iteration: iteration,
				batch_size: batch,
				rate: rate,
			},
			cb
		)
	}

	predict(id, x, out, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'predict',
				x: x,
				out: out,
			},
			cb
		)
	}

	remove(id) {
		this._postMessage({
			id: id,
			mode: 'close',
		})
	}
}

export default class Word2Vec {
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
		this._layers = [{ type: 'input', name: 'in' }]
		this._layers.push({
			type: 'full',
			out_size: reduce_size,
			name: 'reduce',
		})
		this._layers.push({
			type: 'full',
			out_size: this._wordsNumber,
		})

		this._model.initialize(this._layers, optimizer, e => {
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
				idxs.push((this._wordsIdx[word] = this._words.length - 1))
			}
		}
		const x = []
		const y = []
		if (this._method === 'CBOW') {
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
