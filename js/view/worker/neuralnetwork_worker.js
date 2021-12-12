import NeuralNetwork from '../../../lib/model/neuralnetwork.js'

self.model = null

self.addEventListener(
	'message',
	function (e) {
		const data = e.data
		if (data.mode === 'init') {
			self.model = NeuralNetwork.fromObject(data.layers, data.loss, data.optimizer)
			self.postMessage(null)
		} else if (data.mode === 'fit') {
			const samples = data.x.length
			if (samples === 0) {
				self.postMessage(null)
				return
			}

			self.model.fit(data.x, data.y, data.iteration, data.rate, data.batch)
			self.postMessage(null)
		} else if (data.mode === 'predict') {
			const pred = self.model.calc(data.x).toArray()
			self.postMessage(pred)
		}
	},
	false
)
