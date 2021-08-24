import { BasisFunctions } from './least_square.js'
import { Ridge, KernelRidge } from '../model/ridge.js'
import EnsembleBinaryModel from '../js/ensemble.js'

var dispRidge = function (elm, platform) {
	const task = platform.task
	const fitModel = cb => {
		const dim = platform.datas.dimension
		const kernel = elm.select('[name=kernel]').property('value')
		const kernelName = kernel === 'no kernel' ? null : kernel
		platform.fit((tx, ty, fit_cb) => {
			let model
			const l = +elm.select('[name=lambda]').property('value')
			if (task === 'CF') {
				const method = elm.select('[name=method]').property('value')
				if (kernelName) {
					model = new EnsembleBinaryModel(KernelRidge, method, null, [l, kernelName])
				} else {
					model = new EnsembleBinaryModel(Ridge, method, null, [l])
				}
			} else {
				if (kernelName) {
					model = new KernelRidge(l, kernelName)
				} else {
					model = new Ridge(l)
				}
			}

			if (task === 'FS') {
				model.fit(tx, ty)
				const imp = model.importance().map((i, k) => [i, k])
				imp.sort((a, b) => b[0] - a[0])
				const tdim = platform.dimension
				const idx = imp.map(i => i[1]).slice(0, tdim)
				const x = Matrix.fromArray(tx)
				fit_cb(x.col(idx).toArray())
			} else {
				model.fit(basisFunction.apply(tx).toArray(), ty)
				platform.predict(
					(px, pred_cb) => {
						let pred = model.predict(basisFunction.apply(px))
						pred_cb(pred)
					},
					kernelName ? (dim === 1 ? 1 : 10) : dim === 1 ? 100 : 4
				)
			}
		})
	}

	const basisFunction = new BasisFunctions(platform)
	if (task === 'CF') {
		elm.append('select')
			.attr('name', 'method')
			.selectAll('option')
			.data(['oneone', 'onerest'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	}
	if (task !== 'FS') {
		basisFunction.makeHtml(elm)
		elm.append('select')
			.attr('name', 'kernel')
			.selectAll('option')
			.data(['no kernel', 'gaussian'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	} else {
		elm.append('input').attr('type', 'hidden').attr('name', 'kernel').property('value', '')
	}
	elm.append('span').text('lambda = ')
	elm.append('select')
		.attr('name', 'lambda')
		.selectAll('option')
		.data([0, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispRidge(platform.setting.ml.configElement, platform)
	platform.setting.ml.detail = `
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
Therefore, the optimum parameter $ \\hat{W} $ is estimated as
$$
\\hat{W} = \\left( X^T X + \\lambda I \\right)^{-1} X^T y
$$
`
}
