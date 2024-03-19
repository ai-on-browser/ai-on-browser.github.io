import GPLVM from '../../lib/model/gplvm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			const dim = platform.dimension
			model = new GPLVM(dim, alpha.value, ez.value, ea.value, ep.value, {
				name: kernel.value,
				a: 1.0,
				b: gauss_sigma.avlue,
			})
			model.init(platform.trainInput)
		}
		model.fit()
		const y = model.predict(platform.trainInput)
		platform.trainResult = y
	}

	const kernelElm = controller.span()
	const kernel = kernelElm.select(['gaussian'])
	const gauss_sigma = kernelElm.input.number({ label: ' sigma = ', min: 0, max: 10, step: 0.1, value: 1 })
	const alpha = controller.input.number({ label: ' alpha = ', min: 0, max: 10, step: 0.01, value: 0.05 })
	const ez = controller.input.number({ label: ' ez = ', min: 0, max: 10, step: 0.1, value: 1 })
	const ea = controller.input.number({ label: ' ea = ', min: 0, max: 10, step: 0.001, value: 0.005 })
	const ep = controller.input.number({ label: ' ep = ', min: 0, max: 10, step: 0.001, value: 0.02 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
