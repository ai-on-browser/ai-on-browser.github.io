import LSA from '../../lib/model/lsa.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Latent semantic analysis (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Latent_semantic_analysis',
	}
	const controller = new Controller(platform)
	controller.input.button('Fit').on('click', () => {
		const dim = platform.dimension
		const y = new LSA().predict(platform.trainInput, dim)
		platform.trainResult = y
	})
}
