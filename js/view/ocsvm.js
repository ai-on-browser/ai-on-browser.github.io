import OCSVM from '../../lib/model/ocsvm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'J. Jiong, Z. Hao-ran',
		title: 'A Fast Learning Algorithm for One-Class Support Vector Machine',
		year: 2007,
	}
	const controller = new Controller(platform)
	let model = null
	let learn_epoch = 0

	const calcOCSVM = function () {
		for (let i = 0; i < +iteration.value; i++) {
			model.fit()
		}
		learn_epoch += +iteration.value
		const tx = platform.trainInput
		const px = [].concat(tx, platform.testInput(8))
		let pred = model.predict(px)
		const min = Math.min(...pred)
		const max = Math.max(...pred)
		const th = threshold.value
		pred = pred.map(v => (v - min) / (max - min) < th)
		platform.trainResult = pred.slice(0, tx.length)
		platform.testResult(pred.slice(tx.length))
	}

	const nu = controller.input.number({ label: ' nu ', min: 0, max: 1, step: 0.1, value: 0.5 })
	const kernel = controller.select(['gaussian', 'linear']).on('change', () => {
		if (kernel.value === 'gaussian') {
			gamma.element.style.display = 'inline'
		} else {
			gamma.element.style.display = 'none'
		}
	})
	const gamma = controller.input.number({ value: 0.1, min: 0.01, max: 10.0, step: 0.01 })
	const slbConf = controller.stepLoopButtons().init(() => {
		model = new OCSVM(nu.value, { name: kernel.value, d: gamma.value })
		model.init(platform.trainInput, platform.trainOutput)
		learn_epoch = 0
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000] })
	const threshold = controller.input.number({ label: ' threshold = ', min: 0, max: 1, step: 0.01, value: 0.6 })
	slbConf.step(calcOCSVM).epoch(() => learn_epoch)
}
