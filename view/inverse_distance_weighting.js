import InverseDistanceWeighting from '../model/inverse_distance_weighting.js'

var dispIDW = function (elm, platform) {
	const calcIDW = function () {
		const metric = elm.select('[name=metric]').property('value')
		const k = +elm.select('[name=k]').property('value')
		const p = +elm.select('[name=p]').property('value')
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const model = new InverseDistanceWeighting(k, p, metric)
			model.fit(
				tx,
				ty.map(v => v[0])
			)

			platform.predict(
				(px, pred_cb) => {
					const p = model.predict(px)
					pred_cb(p)
				},
				dim === 1 ? 1 : 4
			)
		})
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
