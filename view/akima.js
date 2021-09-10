import AkimaInterpolation from '../lib/model/akima.js'

var dispAkima = function (elm, platform) {
	const calcAkima = function () {
		platform.fit((tx, ty) => {
			const modified = elm.select('[name=modified]').property('value')
			const model = new AkimaInterpolation(modified === 'modified')
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 1)
		})
	}

	elm.append('select')
		.attr('name', 'modified')
		.selectAll('option')
		.data(['', 'modified'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcAkima)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispAkima(platform.setting.ml.configElement, platform)
}
