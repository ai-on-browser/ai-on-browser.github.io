import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import { Projectron, Projectronpp } from '../../lib/model/projectron.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'F. Orabona, J. Keshet, B. Caputo',
		title: 'Bounded kernel-based online learning',
		year: 2009,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(() => {
				if (type.value === 'Projectron') {
					return new Projectron(eta.value, kernel.value)
				} else {
					return new Projectronpp(eta.value, kernel.value)
				}
			}, method.value)
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const type = controller.select(['Projectron', 'Projectron++'])
	const method = controller.select(['oneone', 'onerest'])
	const kernel = controller.select(['gaussian', 'polynomial'])
	const eta = controller.input.number({ label: ' eta ', min: 0, max: 100, step: 0.1, value: 0 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
