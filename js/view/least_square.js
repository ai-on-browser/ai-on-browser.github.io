import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import LeastSquares from '../../lib/model/least_square.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Least squares (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Least_squares',
	}
	platform.setting.ml.detail = `
The model form is
$$
f(X) = \\sum_{k=1}^m a_k g_k(X) + \\epsilon
$$

In the least-squares setting, the loss function can be written as
$$
L(W) = \\| f(X) - y \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
Therefore, the optimum parameter $ \\hat{a} $ is estimated as
$$
\\hat{a} = \\left( G^T G \\right)^{-1} G^T y
$$
where $ G_{ij} = g_i(x_j) $.
`
	const controller = new Controller(platform)
	const fitModel = () => {
		let model
		if (platform.task === 'CF') {
			model = new EnsembleBinaryModel(() => new LeastSquares(), method.value)
		} else {
			model = new LeastSquares()
		}
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(2))
		platform.testResult(pred)
	}

	let method = null
	if (platform.task === 'CF') {
		method = controller.select(['oneone', 'onerest'])
	}

	controller.input.button('Fit').on('click', () => fitModel())
}
