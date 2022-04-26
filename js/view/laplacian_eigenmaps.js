import LaplacianEigenmaps from '../../lib/model/laplacian_eigenmaps.js'
import Controller from '../controller.js'

var dispLE = function (elm, platform) {
	const controller = new Controller(platform)

	const method = controller
		.select({
			values: ['rbf', 'knn'],
			name: 'method',
		})
		.on('change', () => {
			const value = method.value
			paramSpan.selectAll('*').style('display', 'none')
			paramSpan.selectAll(`.${value}`).style('display', 'inline')
		})
	const paramSpan = elm.append('span')
	paramSpan.append('span').classed('rbf', true).text('s =')
	paramSpan
		.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.classed('rbf', true)
		.attr('min', 0.01)
		.attr('max', 100)
		.attr('step', 0.01)
		.property('value', 1)
	const k = controller.input.number({
		label: 'k =',
		name: 'k_nearest',
		min: 1,
		max: 100,
		value: 10,
	})
	controller.input.button('Fit').on('click', () => {
		const sigma = +paramSpan.select('[name=sigma]').property('value')
		const dim = platform.dimension
		const model = new LaplacianEigenmaps(method.value, k.value, sigma)
		const pred = model.predict(platform.trainInput, dim)
		platform.trainResult = pred
	})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLE(platform.setting.ml.configElement, platform)
}
