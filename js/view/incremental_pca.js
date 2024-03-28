import IncrementalPCA from '../../lib/model/incremental_pca.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'T. Oyama, S. G. Karungaru, S. Tsuge, Y. Mitsukura, M. Fukumi',
		title: 'Fast Incremental Algorithm of Simple Principal Component Analysis',
		year: 2009,
	}
	const controller = new Controller(platform)
	controller.input.button('Fit').on('click', () => {
		const dim = platform.dimension
		const model = new IncrementalPCA(undefined, dim)
		model.fit(platform.trainInput)
		const y = model.predict(platform.trainInput)
		platform.trainResult = y
	})
}
