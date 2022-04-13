import GAN from '../../../lib/model/gan.js'

self.model = null

self.addEventListener(
	'message',
	function (e) {
		const data = e.data
		if (data.mode === 'init') {
			self.model = new GAN(
				data.noise_dim,
				data.g_hidden,
				data.d_hidden,
				data.g_opt,
				data.d_opt,
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

			const loss = self.model.fit(data.x, data.y, data.iteration, data.gen_rate, data.dis_rate, data.batch)
			self.postMessage({ epoch: self.model.epoch, ...loss })
		} else if (data.mode === 'prob') {
			const prob = self.model.prob(data.x, data.y)
			self.postMessage(prob)
		} else if (data.mode === 'generate') {
			const generate = self.model.generate(data.n, data.y)
			self.postMessage(generate)
		}
	},
	false
)
