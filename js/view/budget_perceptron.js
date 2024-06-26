import BudgetPerceptron from '../../lib/model/budget_perceptron.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'K. Crammer, J. Kandola, Y. Singer',
		title: 'Online Classification on a Budget',
		year: 2003,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new BudgetPerceptron(beta.value, budgets.value)
			}, method.value)
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select(['oneone', 'onerest'])
	const beta = controller.input.number({ label: ' beta ', min: 0, max: 100, step: 0.1, value: 1 })
	const budgets = controller.input.number({ label: ' budgets ', min: 0, max: 100, value: 10 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
