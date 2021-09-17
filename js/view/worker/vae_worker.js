import VAE from '../../../lib/model/vae.js'

self.model = null

self.addEventListener(
	'message',
	function (e) {
		const data = e.data
		if (data.mode === 'init') {
			self.model = new VAE(
				data.in_size,
				data.noise_dim,
				data.enc_layers,
				data.dec_layers,
				data.optimizer,
				data.class_size,
				data.type
			)
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
			const pred = self.model.predict(data.x, data.y, data.out)
			self.postMessage(pred)
		}
	},
	false
)
