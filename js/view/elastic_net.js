import Matrix from '../../lib/util/matrix.js'

import { BasisFunctions } from './least_square.js'

import ElasticNet from '../../lib/model/elastic_net.js'

var dispElasticNet = function (elm, platform) {
	let model = new ElasticNet()
	const task = platform.task
	const fitModel = cb => {
		platform.fit((tx, ty, fit_cb) => {
			model._alpha = +elm.select('[name=alpha]').property('value')
			if (task === 'FS') {
				model.fit(tx, ty)
				const imp = model.importance().map((i, k) => [i, k])
				imp.sort((a, b) => b[0] - a[0])
				const tdim = platform.dimension
				const idx = imp.map(i => i[1]).slice(0, tdim)
				const x = Matrix.fromArray(tx)
				fit_cb(x.col(idx).toArray())
				cb && cb()
			} else {
				model.fit(basisFunction.apply(tx).toArray(), ty)
				platform.predict((px, pred_cb) => {
					const pred = model.predict(basisFunction.apply(px).toArray())
					pred_cb(pred)

					cb && cb()
				}, 4)
			}
		})
	}

	const basisFunction = new BasisFunctions(platform)
	if (task !== 'FS') {
		basisFunction.makeHtml(elm)
	}
	elm.append('span').text('lambda = ')
	elm.append('select')
		.attr('name', 'lambda')
		.selectAll('option')
		.data([0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text('alpha = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('value', 0.5)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
		.on('change', function () {
			let val = +d3.select(this).property('value')
			elm.select('[name=sp]').text(val === 0 ? ' ridge ' : val === 1 ? ' lasso ' : '')
		})
	elm.append('span').attr('name', 'sp')
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = new ElasticNet(
				+elm.select('[name=lambda]').property('value'),
				+elm.select('[name=alpha]').property('value')
			)
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispElasticNet(platform.setting.ml.configElement, platform)
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
}
