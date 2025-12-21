import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

import { KernelRidge, MulticlassRidge, Ridge } from '../../lib/model/ridge.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Ridge regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Ridge_regression',
	}
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
	const controller = new Controller(platform)
	const task = platform.task
	const fitModel = () => {
		const dim = platform.datas.dimension
		const kernelName = kernel.value === 'no kernel' ? null : kernel.value
		let model
		const l = +lambda.value
		if (task === 'CF') {
			if (kernelName) {
				model = new EnsembleBinaryModel(() => new KernelRidge(l, kernelName), method.value)
			} else {
				if (method.value === 'multiclass') {
					model = new MulticlassRidge(l)
				} else {
					model = new EnsembleBinaryModel(() => new Ridge(l), method.value)
				}
			}
		} else {
			if (kernelName) {
				model = new KernelRidge(l, kernelName)
			} else {
				model = new Ridge(l)
			}
		}

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
			const pred = model.predict(platform.testInput(kernelName ? (dim === 1 ? 1 : 10) : dim === 1 ? 100 : 4))
			platform.testResult(pred)
		}
	}

	let method = null
	if (task === 'CF') {
		method = controller.select(['oneone', 'onerest', 'multiclass']).on('change', () => {
			if (method.value === 'multiclass') {
				kernel.element.style.display = 'none'
			} else {
				kernel.element.style.display = null
			}
		})
	}
	let kernel = null
	if (task !== 'FS') {
		kernel = controller.select(['no kernel', 'gaussian'])
	} else {
		kernel = controller.input({ type: 'hidden', value: '' })
	}
	const lambda = controller.select({ label: 'lambda = ', values: [0, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100] })
	controller.input.button('Fit').on('click', () => fitModel())
}
