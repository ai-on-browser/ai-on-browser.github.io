import Matrix from '../../lib/util/matrix.js'

import ElasticNet from '../../lib/model/elastic_net.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'H. Zou, T. Hastie',
		title: 'Regularization and variable selection via the elastic net',
		year: 2005,
	}
	platform.setting.ml.detail = `
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\alpha \\lambda \\| W \\|_1 + (1 - \\alpha) \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
`
	const controller = new Controller(platform)
	let model = new ElasticNet()
	const task = platform.task
	const fitModel = () => {
		model._alpha = +alpha.value
		if (task === 'FS') {
			model.fit(platform.trainInput, platform.trainOutput)
			const imp = model.importance().map((i, k) => [i, k])
			imp.sort((a, b) => b[0] - a[0])
			const tdim = platform.dimension
			const idx = imp.map(i => i[1]).slice(0, tdim)
			const x = Matrix.fromArray(platform.trainInput)
			platform.trainResult = x.col(idx).toArray()
		} else {
			model.fit(platform.trainInput, platform.trainOutput)
			const pred = model.predict(platform.testInput(4))
			platform.testResult(pred)
		}
	}

	const lambda = controller.select({
		label: 'lambda = ',
		name: 'lambda',
		values: [0.0001, 0.001, 0.01, 0.1, 1, 10, 100],
	})
	const alpha = controller.input
		.number({ label: 'alpha = ', name: 'alpha', value: 0.5, min: 0, max: 1, step: 0.1 })
		.on('change', () => {
			let val = +alpha.value
			sp.value = val === 0 ? ' ridge ' : val === 1 ? ' lasso ' : ''
		})
	const sp = controller.text()
	controller
		.stepLoopButtons()
		.init(() => {
			model = new ElasticNet(+lambda.value, +alpha.value)
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
