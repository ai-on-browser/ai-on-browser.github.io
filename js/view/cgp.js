import CartesianGeneticProgramming from '../../lib/model/cgp.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'J. F. Miller',
		title: 'An empirical study of the efficiency of learning boolean functions using a Cartesian Genetic Programming approach',
		year: 1999,
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new CartesianGeneticProgramming(rows.value, cols.value)
			model.init(platform.trainInput, platform.trainOutput)
		}
		model.fit()

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
		expr.value = model.bestProgram.toString()
	}

	const rows = controller.input.number({ label: 'n', min: 1, max: 10, value: 1 })
	const cols = controller.input.number({ label: 'm', min: 1, max: 100, value: 10 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			expr.value = ''
			platform.init()
		})
		.step(fitModel)
		.epoch()
	const expr = controller.div().text({ label: 'estimated function: ' })
}
