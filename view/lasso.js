import { BasisFunctions } from './least_square.js'

import LassoWorker from '../model/lasso.js'

var dispLasso = function (elm, platform) {
	let model = new LassoWorker()
	const task = platform.task
	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			if (task === 'FS') {
				model.fit(tx, ty, 1, () => {
					model.importance(e => {
						const imp = e.data.map((i, k) => [i, k])
						imp.sort((a, b) => b[0] - a[0])
						const tdim = platform.dimension
						const idx = imp.map(i => i[1]).slice(0, tdim)
						const x = Matrix.fromArray(tx)
						pred_cb(x.col(idx).toArray())
						cb && cb()
					})
				})
			} else {
				model.fit(basisFunction.apply(tx).toArray(), ty, 1, () => {
					platform.predict((px, pred_cb) => {
						model.predict(basisFunction.apply(px).toArray(), e => {
							pred_cb(e.data)

							cb && cb()
						})
					}, 4)
				})
			}
		})
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
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model.initialize(
				+elm.select('[name=lambda]').property('value'),
				elm.select('[name=method]').property('value')
			)
			platform.init()
		})
		.step(fitModel)
		.epoch()

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispLasso(platform.setting.ml.configElement, platform)
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
