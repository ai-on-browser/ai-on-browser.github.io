import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import { AggressiveROMMA, ROMMA } from '../../lib/model/romma.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'Y. Li, P. M. Long',
		title: 'The Relaxed Online Maximum Margin Algorithm',
		year: 2002,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(
				() => (type.value === '' ? new ROMMA() : new AggressiveROMMA()),
				method.value
			)
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select(['oneone', 'onerest'])
	const type = controller.select(['', 'aggressive'])
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
