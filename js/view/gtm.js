import GTM from '../../lib/model/gtm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const mode = platform.task
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			return
		}

		model.fit(platform.trainInput)
		if (mode === 'CT') {
			const pred = model.predictIndex(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
			const tilePred = model.predictIndex(platform.testInput(4))
			platform.testResult(tilePred.map(v => v + 1))
		} else {
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred
		}
	}

	let resolution = null
	if (mode !== 'DR') {
		resolution = controller.input.number({ label: ' Size ', min: 1, max: 100, value: 10 })
	} else {
		resolution = controller.input.number({ label: ' Resolution ', min: 1, max: 100, value: 20 })
	}
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			if (platform.datas.length === 0) {
				return
			}
			const dim = platform.dimension || 1

			model = new GTM(2, dim, resolution.value)
		})
		.step(fitModel)
		.epoch()
}
