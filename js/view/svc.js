import SVC from '../../lib/model/svc.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'A. Ben-Hur, D. Horn, H. T. Siegelmann, V. Vapnik',
		title: 'Support Vector Clustering',
		year: 2001,
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		model.fit()
		clusters.value = model.size
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		cb && cb()
	}

	const kernel = controller.select(['gaussian', 'linear']).on('change', () => {
		if (kernel.value === 'gaussian') {
			gamma.element.style.display = 'inline'
		} else {
			gamma.element.style.display = 'none'
		}
	})
	const gamma = controller.input.number({
		value: 0.1,
		min: 0.01,
		max: 10.0,
		step: 0.01,
	})
	controller
		.stepLoopButtons()
		.init(() => {
			const kernel_args = []
			if (kernel.value === 'gaussian') {
				kernel_args.push(gamma.value)
			}
			model = new SVC(kernel.value, kernel_args)
			model.init(platform.trainInput)
			platform.init()
		})
		.step(fitModel)
		.epoch()
	const clusters = controller.text({ label: ' Clusters: ' })
}
