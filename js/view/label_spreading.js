import LabelSpreading from '../../lib/model/label_spreading.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new LabelSpreading(alpha.value, { name: method.value, sigma: sigma.value, k: k.value })
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
		}
		model.fit()
		platform.trainResult = model.predict()
	}
	const method = controller.select(['rbf', 'knn']).on('change', function () {
		const value = method.value
		rbfSpan.element.style.display = 'none'
		if (value === 'rbf') {
			rbfSpan.element.style.display = 'inline'
		}
	})
	const rbfSpan = controller.span()
	const sigma = rbfSpan.input.number({ label: 's =', min: 0.01, max: 100, step: 0.01, value: 1 })
	const k = controller.input.number({ label: 'k =', min: 1, max: 1000, value: 10 })
	const alpha = controller.input.number({ label: 'alpha', min: 0, max: 1, step: 0.1, value: 0.2 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(() => fitModel())
		.epoch()
}
