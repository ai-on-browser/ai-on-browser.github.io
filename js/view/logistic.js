import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import { LogisticRegression, MultinomialLogisticRegression } from '../../lib/model/logistic.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const step = 4

	let learn_epoch = 0
	let model = null

	const fitModel = () => {
		if (!model) {
			return
		}

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0]),
			+iteration.value,
			rate.value,
			l1.value,
			l2.value
		)
		const pred = model.predict(platform.testInput(step))
		platform.testResult(pred)
		learn_epoch += +iteration.value
	}

	const method = controller.select({ values: ['oneone', 'onerest', 'multinomial'], value: 'multinomial' })
	const slbConf = controller.stepLoopButtons().init(() => {
		learn_epoch = 0
		if (method.value === 'multinomial') {
			model = new MultinomialLogisticRegression()
		} else {
			model = new EnsembleBinaryModel(() => new LogisticRegression(), method.value)
		}
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const l1 = controller.input.number({ label: ' l1 = ', min: 0, max: 10, step: 0.1, value: 0 })
	const l2 = controller.input.number({ label: ' l2 = ', min: 0, max: 10, step: 0.1, value: 0 })
	slbConf.step(fitModel).epoch(() => learn_epoch)
}
