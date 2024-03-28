import Isomap from '../../lib/model/isomap.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Isomap (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Isomap',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.dimension
		const y = new Isomap(neighbors.value, dim).predict(platform.trainInput)
		platform.trainResult = y
	}

	const neighbors = controller.input.number({ label: ' neighbors = ', min: 0, max: 10000, value: 10 })
	controller.input.button('Fit').on('click', () => fitModel())
}
