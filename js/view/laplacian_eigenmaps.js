import LaplacianEigenmaps from '../../lib/model/laplacian_eigenmaps.js'

var dispLE = function (elm, platform) {
	elm.append('select')
		.attr('name', 'method')
		.on('change', function () {
			const value = d3.select(this).property('value')
			paramSpan.selectAll('*').style('display', 'none')
			paramSpan.selectAll(`.${value}`).style('display', 'inline')
		})
		.selectAll('option')
		.data(['rbf', 'knn'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
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
	elm.append('span').text('k =')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k_nearest')
		.attr('min', 1)
		.attr('max', 100)
		.property('value', 10)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			const method = elm.select('[name=method]').property('value')
			const sigma = +paramSpan.select('[name=sigma]').property('value')
			const k = +elm.select('[name=k_nearest]').property('value')
			const dim = platform.dimension
			const model = new LaplacianEigenmaps(method, k, sigma)
			const pred = model.predict(platform.trainInput, dim)
			platform.trainResult = pred
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLE(platform.setting.ml.configElement, platform)
}
