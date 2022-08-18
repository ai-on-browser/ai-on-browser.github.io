import Matrix from '../../lib/util/matrix.js'

import AverageShiftedHistogram from '../../lib/model/average_shifted_histogram.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

var dispAverageShiftedHistogram = function (elm, platform) {
	const controller = new Controller(platform)
	const fitModel = () => {
		const scale = platform.width / (platform.datas.domain[0][1] - platform.datas.domain[0][0])
		const model = new AverageShiftedHistogram(
			{
				domain: platform.datas.domain,
				size: bin.value / scale,
			},
			aggregate.value
		)
		const d = model.fit(platform.trainInput)

		let pred = Matrix.fromArray(d).value
		const m = Math.max(...pred)
		pred = pred.map(v => specialCategory.density(v / m))
		platform.testInput(bin.value)
		platform.testResult(pred)
	}

	const bin = controller.input.number({ label: 'bin size ', min: 1, max: 100, value: 10 }).on('change', fitModel)
	const aggregate = controller.input
		.number({ label: 'aggregate ', min: 1, max: 100, value: 10 })
		.on('change', fitModel)
	controller.input.button('Fit').on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispAverageShiftedHistogram(platform.setting.ml.configElement, platform)
}
