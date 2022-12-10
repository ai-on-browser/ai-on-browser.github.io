import Matrix from '../../lib/util/matrix.js'

import { BasisFunctions } from './least_square.js'

import Lasso from '../../lib/model/lasso.js'
import Controller from '../controller.js'

var dispLasso = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Lasso (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Lasso_(statistics)',
	}
	const controller = new Controller(platform)
	let model = null
	const task = platform.task
	const fitModel = cb => {
		if (task === 'FS') {
			model.fit(platform.trainInput, platform.trainOutput)
			const imp = model.importance().map((i, k) => [i, k])
			imp.sort((a, b) => b[0] - a[0])
			const tdim = platform.dimension
			const idx = imp.map(i => i[1]).slice(0, tdim)
			const x = Matrix.fromArray(platform.trainInput)
			platform.trainResult = x.col(idx).toArray()
			cb && cb()
		} else {
			model.fit(basisFunction.apply(platform.trainInput).toArray(), platform.trainOutput)
			const pred = model.predict(basisFunction.apply(platform.testInput(4)).toArray())
			platform.testResult(pred)

			cb && cb()
		}
	}

	const basisFunction = new BasisFunctions(platform)
	if (task !== 'FS') {
		basisFunction.makeHtml(elm)
	}
	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['CD', 'ISTA', 'LARS'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text('lambda = ')
	elm.append('select')
		.attr('name', 'lambda')
		.selectAll('option')
		.data([0, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	controller
		.stepLoopButtons()
		.init(() => {
			model = new Lasso(
				+elm.select('[name=lambda]').property('value'),
				elm.select('[name=method]').property('value')
			)
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispLasso(platform.setting.ml.configElement, platform)
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
}
