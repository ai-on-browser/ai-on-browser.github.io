import FastMap from '../../lib/model/fastmap.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'C. Faloutsos, KI. Lin',
		title: 'FastMap: A fast algorithm for indexing, data-mining and visualization of traditional and multimedia datasets',
		year: 1995,
	}
	const controller = new Controller(platform)
	controller.input.button('Fit').on('click', () => {
		const dim = platform.dimension
		const pred = new FastMap(dim).predict(platform.trainInput)
		platform.trainResult = pred
	})
}
