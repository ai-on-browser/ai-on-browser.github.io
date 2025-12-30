import { XGBoost, XGBoostClassifier } from '../../lib/model/xgboost.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const task = platform.task
	let model = null
	const fitModel = () => {
		if (!model) {
			if (task === 'CF') {
				model = new XGBoostClassifier(maxd.value, srate.value, lambda.value, lr.value)
				model.init(
					platform.trainInput,
					platform.trainOutput.map(v => v[0])
				)
			} else {
				model = new XGBoost(maxd.value, srate.value, lambda.value, lr.value)
				model.init(platform.trainInput, platform.trainOutput)
			}
		}
		for (let i = 0; i < itr.value; i++) {
			model.fit()
		}

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	const maxd = controller.input.number({ label: ' max depth = ', min: 1, max: 10, value: 1 })
	const srate = controller.input.number({ label: ' Sampling rate ', min: 0.1, max: 1, step: 0.1, value: 0.8 })
	const lambda = controller.input.number({ label: ' lambda = ', min: 0.1, max: 10, step: 0.1, value: 0.1 })
	const lr = controller.input.number({ label: ' learning rate = ', min: 0, max: 10, step: 0.1, value: 0.1 })
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	const itr = controller.input.number({ label: ' Iteration ', min: 1, max: 100, value: 1 })
	slbConf.step(fitModel).epoch(() => model.size)
}
