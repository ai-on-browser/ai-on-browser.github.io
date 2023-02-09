import AverageShiftedHistogram from '../../lib/model/average_shifted_histogram.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new AverageShiftedHistogram({ domain: platform.datas.domain, size: bin.value }, aggregate.value)
		model.fit(platform.trainInput)
		const d = model.predict(platform.testInput(3))

		const m = d.reduce((a, v) => Math.max(a, v), -Infinity)
		const pred = d.map(v => specialCategory.density(v / m))
		platform.testResult(pred)
	}

	const bin = controller.input
		.number({ label: 'bin size ', min: 0.001, max: 100, step: 0.001, value: 0.01 })
		.on('change', fitModel)
	const aggregate = controller.input
		.number({ label: 'aggregate ', min: 1, max: 100, value: 10 })
		.on('change', fitModel)
	controller.input.button('Fit').on('click', () => fitModel())
}
