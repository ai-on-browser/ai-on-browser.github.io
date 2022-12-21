import {
	SimpleMovingAverage,
	LinearWeightedMovingAverage,
	TriangularMovingAverage,
} from '../../lib/model/moving_average.js'

var dispMovingAverage = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Moving average (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Moving_average',
	}
	const fitModel = () => {
		const method = elm.select('[name=method]').property('value')
		const k = +elm.select('[name=k]').property('value')
		let model
		switch (method) {
			case 'simple':
				model = new SimpleMovingAverage()
				break
			case 'linear weighted':
				model = new LinearWeightedMovingAverage()
				break
			case 'triangular':
				model = new TriangularMovingAverage()
				break
		}
		const tx = platform.trainInput
		const pred = []
		for (let i = 0; i < tx.length; pred[i++] = []);
		for (let d = 0; d < tx[0].length; d++) {
			const xd = tx.map(v => v[d])
			const p = model.predict(xd, k)
			for (let i = 0; i < pred.length; i++) {
				pred[i][d] = p[i]
			}
		}
		platform.trainResult = pred
	}

	elm.append('select')
		.attr('name', 'method')
		.on('change', () => {
			fitModel()
		})
		.selectAll('option')
		.data(['simple', 'linear weighted', 'triangular'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('k')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 5)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispMovingAverage(platform.setting.ml.configElement, platform)
}
