import Autoencoder from '../../../lib/model/autoencoder.js'

self.model = null

self.addEventListener(
	'message',
	function (e) {
		const data = e.data
		if (data.mode === 'init') {
			self.model = new Autoencoder(
				data.input_size,
				data.reduce_size,
				data.enc_layers,
				data.dec_layers,
				data.optimizer
			)
			self.postMessage(null)
		} else if (data.mode === 'fit') {
			const samples = data.x.length
			if (samples === 0) {
				self.postMessage(null)
				return
			}

			const loss = self.model.fit(data.x, data.iteration, data.rate, data.batch, data.rho)
			self.postMessage({ epoch: self.model.epoch, loss })
		} else if (data.mode === 'predict') {
			const pred = self.model.predict(data.x)
			self.postMessage(pred)
		} else if (data.mode === 'reduce') {
			const reduce = self.model.reduce(data.x)
			self.postMessage(reduce)
		}
	},
	false
)
