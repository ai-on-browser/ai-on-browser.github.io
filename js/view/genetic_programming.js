import GeneticProgramming from '../../lib/model/genetic_programming.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'J. R. Koza',
		title: 'Genetic Programming as a Means for Programming Computers by Natural Selection',
		year: 1994,
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new GeneticProgramming()
			model.init(platform.trainInput, platform.trainOutput)
		}
		model.fit()

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
		expr.value = model.bestPrograms[0].toString()
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
	const expr = controller.div().text({ label: 'estimated function: ' })
}
