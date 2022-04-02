import HDBSCAN from '../../lib/model/hdbscan.js'

var dispHDBSCAN = function (elm, platform) {
	const svg = platform.svg
	svg.insert('g', ':first-child').attr('class', 'range').attr('opacity', 0.4)

	const fitModel = cb => {
		svg.selectAll('.range *').remove()
		const metric = elm.select('[name=metric]').property('value')
		const minClusterSize = +elm.select('[name=minclustersize]').property('value')
		const minpts = +elm.select('[name=minpts]').property('value')
		const model = new HDBSCAN(minClusterSize, minpts, metric)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(model.size)

		cb && cb()
	}

	elm.append('select')
		.attr('name', 'metric')
		.on('change', fitModel)
		.selectAll('option')
		.data(['euclid', 'manhattan', 'chebyshev'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('min cluster size')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'minclustersize')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 5)
		.on('change', fitModel)
	elm.append('span').text('min pts')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'minpts')
		.attr('min', 2)
		.attr('max', 1000)
		.attr('value', 5)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
	return () => {
		svg.select('.range').remove()
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispHDBSCAN(platform.setting.ml.configElement, platform)
}
