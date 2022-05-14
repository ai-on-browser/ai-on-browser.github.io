import Matrix from '../../lib/util/matrix.js'

import Histogram from '../../lib/model/histogram.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const width = platform.width
		const height = platform.height
		const d = new Histogram({
			domain: platform.datas.domain,
			count: method.value !== 'manual' ? null : bins.value,
			binMethod: method.value,
		}).fit(platform.trainInput)

		platform.testInput([width / d.length, height / d[0].length])
		let pred = Matrix.fromArray(d)
		pred.div(pred.max())
		pred = pred.value.map(specialCategory.density)
		platform.testResult(pred)
	}

	const method = controller.select(['manual', 'fd', 'scott', 'rice', 'sturges', 'doane', 'sqrt']).on('change', () => {
		bins.element.disabled = method.value !== 'manual'
		fitModel()
	})
	const bins = controller.input.number({ label: 'bins ', min: 2, value: 10 }).on('change', fitModel)
	controller.input.button('Fit').on('click', () => fitModel())
}
