import OPTICS from '../../lib/model/optics.js'

var dispOPTICS = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'OPTICS algorithm (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/OPTICS_algorithm',
	}
	let model = null

	const fitModel = (doFit = true) => {
		if (!model || doFit) {
			const metric = elm.select('[name=metric]').property('value')
			const eps = +elm.select('[name=eps]').property('value')
			const minpts = +elm.select('[name=minpts]').property('value')
			model = new OPTICS(eps, minpts, metric)
			model.fit(platform.trainInput)
		}
		const threshold = +elm.select('[name=threshold]').property('value')
		const pred = model.predict(threshold)
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(new Set(pred).size)
	}

	elm.append('select')
		.attr('name', 'metric')
		.on('change', () => fitModel())
		.selectAll('option')
		.data(['euclid', 'manhattan', 'chebyshev'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('eps')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'eps')
		.attr('min', 0.01)
		.attr('max', 100)
		.attr('step', 0.01)
		.attr('value', 100)
		.on('change', () => fitModel())
	elm.append('span').text('min pts')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'minpts')
		.attr('min', 2)
		.attr('max', 1000)
		.attr('value', 10)
		.on('change', () => fitModel())
	const stepButton = elm
		.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
	elm.append('span').text('threshold')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('min', 0.01)
		.attr('max', 10)
		.attr('step', 0.01)
		.attr('value', 0.08)
		.on('change', () => fitModel(false))
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispOPTICS(platform.setting.ml.configElement, platform)
}
