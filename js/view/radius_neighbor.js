import {
	RadiusNeighbor,
	RadiusNeighborRegression,
	SemiSupervisedRadiusNeighbor,
} from '../../lib/model/radius_neighbor.js'

var dispRN = function (elm, platform) {
	const mode = platform.task

	const calc = function () {
		const r = +elm.select('[name=r]').property('value')
		const metric = elm.select('[name=metric]').property('value')
		if (mode === 'CF') {
			platform.fit((tx, ty) => {
				const model = new RadiusNeighbor(r, metric)
				model.fit(
					tx,
					ty.map(v => v[0])
				)
				platform.predict((px, pred_cb) => {
					const pred = model.predict(px)
					pred_cb(pred.map(v => v ?? -1))
				}, 4)
			})
		} else if (mode === 'RG') {
			const dim = platform.datas.dimension
			platform.fit((tx, ty) => {
				const model = new RadiusNeighborRegression(r, metric)
				model.fit(
					tx,
					ty.map(v => v[0])
				)

				platform.predict(
					(px, pred_cb) => {
						let p = model.predict(px)

						pred_cb(p)
					},
					dim === 1 ? 1 : 4
				)
			})
		} else if (mode === 'SC') {
			platform.fit((tx, ty, cb) => {
				const model = new SemiSupervisedRadiusNeighbor(r, metric)
				model.fit(
					tx,
					ty.map(v => v[0])
				)
				cb(model.predict())
			})
		}
	}

	elm.append('select')
		.attr('name', 'metric')
		.selectAll('option')
		.data(['euclid', 'manhattan', 'chebyshev'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' r = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'r')
		.attr('value', 0.2)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispRN(platform.setting.ml.configElement, platform)
}
