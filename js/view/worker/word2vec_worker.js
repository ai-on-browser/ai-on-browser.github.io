import Word2Vec from '../../../lib/model/word_to_vec.js'

self.model = null

self.addEventListener(
	'message',
	function (e) {
		const data = e.data
		if (data.mode === 'init') {
			self.model = new Word2Vec(data.method, data.n, data.wordsOrNumber, data.reduce_size, data.optimizer)
			self.postMessage(null)
		} else if (data.mode === 'fit') {
			const samples = data.words.length
			if (samples === 0) {
				self.postMessage(null)
				return
			}

			const loss = self.model.fit(data.words, data.iteration, data.rate, data.batch)
			self.postMessage({ epoch: self.model.epoch, loss })
		} else if (data.mode === 'predict') {
			const pred = self.model.predict(data.x)
			self.postMessage(pred)
		} else if (data.mode === 'reduce') {
			const pred = self.model.reduce(data.x)
			self.postMessage(pred)
		}
	},
	false
)
