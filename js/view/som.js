import SOM from '../../lib/model/som.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Self-organizing map (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Self-organizing_map',
	}
	const controller = new Controller(platform)
	const mode = platform.task
	let model = null

	const fitModel = () => {
		if (!model) {
			return
		}

		if (mode === 'CT') {
			model.fit(platform.trainInput)
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v[0] + 1)
			const tilePred = model.predict(platform.testInput(4))
			platform.testResult(tilePred.map(v => v[0] + 1))

			platform.centroids(
				model._y,
				model._y.map((v, i) => i + 1)
			)
		} else {
			model.fit(platform.trainInput)
			const pred = model.predict(platform.trainInput)

			platform.trainResult = pred
		}
	}

	controller.select(['batch'])

	let resolution = null
	if (mode != 'DR') {
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

			model = new SOM(2, dim, resolution.value)
		})
		.step(fitModel)
		.epoch()
}
