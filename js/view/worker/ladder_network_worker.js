import LadderNetwork from '../../../lib/model/ladder_network.js'

self.model = null

self.addEventListener(
	'message',
	function (e) {
		const data = e.data
		if (data.mode === 'init') {
			self.model = new LadderNetwork(data.hidden_sizes, data.lambdas, data.activation, data.optimizer)
			self.postMessage(null)
		} else if (data.mode === 'fit') {
			const samples = data.x.length
			if (samples === 0) {
				self.postMessage(null)
				return
			}

			const loss = self.model.fit(data.x, data.y, data.iteration, data.rate, data.batch)
			self.postMessage({ epoch: self.model.epoch, ...loss })
		} else if (data.mode === 'predict') {
			const pred = self.model.predict(data.x)
			self.postMessage(pred)
		}
	},
	false
)
