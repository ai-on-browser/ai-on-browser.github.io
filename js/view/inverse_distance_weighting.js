import InverseDistanceWeighting from '../../lib/model/inverse_distance_weighting.js'

var dispIDW = (elm, platform) => {
	platform.setting.ml.reference = {
		title: 'Inverse distance weighting (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Inverse_distance_weighting',
	}
	const calcIDW = () => {
		const metric = elm.select('[name=metric]').property('value')
		const k = +elm.select('[name=k]').property('value')
		const p = +elm.select('[name=p]').property('value')
		const dim = platform.datas.dimension
		const model = new InverseDistanceWeighting(k, p, metric)
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const pred = model.predict(platform.testInput(dim === 1 ? 1 : 4))
		platform.testResult(pred)
	}

	elm.append('select')
		.attr('name', 'metric')
		.on('change', calcIDW)
		.selectAll('option')
		.data(['euclid', 'manhattan', 'chebyshev'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' k = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('value', 2)
		.attr('min', 1)
		.attr('max', 100)
		.on('change', calcIDW)
	elm.append('span').text(' p = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'p')
		.attr('value', 2)
		.attr('min', 0)
		.attr('max', 100)
		.on('change', calcIDW)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcIDW)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispIDW(platform.setting.ml.configElement, platform)
}
