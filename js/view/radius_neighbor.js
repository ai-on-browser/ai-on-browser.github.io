import {
	RadiusNeighbor,
	RadiusNeighborRegression,
	SemiSupervisedRadiusNeighbor,
} from '../../lib/model/radius_neighbor.js'

var dispRN = (elm, platform) => {
	const mode = platform.task

	const calc = () => {
		const r = +elm.select('[name=r]').property('value')
		const metric = elm.select('[name=metric]').property('value')
		if (mode === 'CF') {
			const model = new RadiusNeighbor(r, metric)
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
			const pred = model.predict(platform.testInput(4))
			platform.testResult(pred.map(v => v ?? -1))
		} else if (mode === 'RG') {
			const dim = platform.datas.dimension
			const model = new RadiusNeighborRegression(r, metric)
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)

			const p = model.predict(platform.testInput(dim === 1 ? 1 : 4))

			platform.testResult(p.map(v => v ?? -1))
		} else if (mode === 'SC') {
			const model = new SemiSupervisedRadiusNeighbor(r, metric)
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
			platform.trainResult = model.predict()
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
