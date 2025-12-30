import Lasso from '../../lib/model/lasso.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Lasso (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Lasso_(statistics)',
	}
	platform.setting.ml.detail = `
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|_1
$$
where $ y $ is the observed value corresponding to $ X $.
`
	const controller = new Controller(platform)
	let model = null
	const task = platform.task
	const fitModel = () => {
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

	const method = controller.select(['CD', 'ISTA', 'LARS'])
	const lambda = controller.select({ label: 'lambda = ', values: [0, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100] })
	controller
		.stepLoopButtons()
		.init(() => {
			model = new Lasso(+lambda.value, method.value)
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
