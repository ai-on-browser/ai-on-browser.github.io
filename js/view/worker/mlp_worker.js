import MLP from '../../../lib/model/mlp.js'

self.model = null

self.addEventListener(
	'message',
	function (e) {
		const data = e.data
		if (data.mode === 'init') {
			self.model = new MLP(data.output_size, data.layers, data.optimizer)
			self.postMessage(null)
		} else if (data.mode === 'fit') {
			const samples = data.x.length
			if (samples === 0) {
				self.postMessage(null)
				return
			}

			self.model.fit(data.x, data.y, data.iteration, data.rate, data.batch)
			self.postMessage({ epoch: self.model.epoch })
		} else if (data.mode === 'predict') {
			const pred = self.model.predict(data.x)
			self.postMessage(pred)
		}
	},
	false
)
