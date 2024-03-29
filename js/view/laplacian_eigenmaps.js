import LaplacianEigenmaps from '../../lib/model/laplacian_eigenmaps.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)

	const method = controller.select({ values: ['rbf', 'knn'], name: 'method' }).on('change', () => {
		const value = method.value
		paramSpan.selectAll('*').style('display', 'none')
		paramSpan.selectAll(`.${value}`).style('display', 'inline')
	})
	const paramSpan = controller.span()
	paramSpan.element.classList.add('rbf')
	const sigma = paramSpan.input.number({ label: 's =', min: 0.01, max: 100, step: 0.01, value: 1 })
	const k = controller.input.number({ label: 'k =', name: 'k_nearest', min: 1, max: 100, value: 10 })
	controller.input.button('Fit').on('click', () => {
		const dim = platform.dimension
		const model = new LaplacianEigenmaps(dim, method.value, k.value, sigma.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred
	})
}
