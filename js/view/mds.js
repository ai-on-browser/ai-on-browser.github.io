import MDS from '../../lib/model/mds.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Multidimensional scaling (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Multidimensional_scaling',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.dimension
		const y = new MDS(dim).predict(platform.trainInput)
		platform.trainResult = y
	}

	controller.input.button('Fit').on('click', () => fitModel())
}
