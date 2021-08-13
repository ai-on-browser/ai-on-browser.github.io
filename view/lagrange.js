import LagrangeInterpolation from '../model/lagrange.js'

var dispLagrange = function (elm, platform) {
	const calcLagrange = function () {
		platform.fit((tx, ty) => {
			const method = elm.select('[name=method]').property('value')
			let model = new LagrangeInterpolation(method)
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 2)
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['', 'weighted', 'newton'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLagrange)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLagrange(platform.setting.ml.configElement, platform)
}
