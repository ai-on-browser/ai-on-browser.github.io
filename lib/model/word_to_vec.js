import NeuralNetwork from './neuralnetwork.js'

/**
 * Word2Vec
 */
export default class Word2Vec {
	// https://qiita.com/g-k/items/69afa87c73654af49d36
	/**
	 *
	 * @param {'CBOW' | 'skip-gram'} method Method name
	 * @param {number} n Number of how many adjacent words to learn
	 * @param {number | string[]} wordsOrNumber Initial words or number of words
	 * @param {number} reduce_size Reduced dimension
	 * @param {string} optimizer Optimizer of the network
	 */
	constructor(method, n, wordsOrNumber, reduce_size, optimizer) {
		this._words = [null]
		this._wordsIdx = {}
		this._wordsNumber = null
		this._n = n
		this._method = method

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

		this._model = NeuralNetwork.fromObject(this._layers, 'mse', optimizer)
		this._epoch = 0
	}

	/**
	 * Epoch
	 *
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	/**
	 * Fit model.
	 *
	 * @param {string[]} words Training data
	 * @param {number} iteration Iteration count
	 * @param {number} rate Learning rate
	 * @param {number} batch Batch size
	 * @returns {number} Loss value
	 */
	fit(words, iteration, rate, batch) {
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
		const loss = this._model.fit(x, y, iteration, rate, batch)
		this._epoch += iteration
		return loss[0]
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {string[]} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
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
		const pred = this._model.calc(tx)
		return pred.toArray()
	}

	/**
	 * Returns reduced values.
	 *
	 * @param {string[]} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	reduce(x) {
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
		const red = this._model.calc(tx, null, ['reduce'])
		return red.reduce.toArray()
	}
}
