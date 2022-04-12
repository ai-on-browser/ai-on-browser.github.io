import RNN from '../../../lib/model/rnn.js'

self.model = null

self.addEventListener(
	'message',
	function (e) {
		const data = e.data
		if (data.mode === 'init') {
			self.model = new RNN(data.method, data.window, data.unit, data.out_size, data.optimizer)
			self.postMessage(null)
		} else if (data.mode === 'fit') {
			const samples = data.x.length
			if (samples === 0) {
				self.postMessage(null)
				return
			}

			const loss = self.model.fit(data.x, data.y, data.iteration, data.rate, data.batch)
			self.postMessage({ epoch: self.model.epoch, loss })
		} else if (data.mode === 'predict') {
			const pred = self.model.predict(data.x, data.k)
			self.postMessage(pred)
		}
	},
	false
)
