import Slerp from '../lib/model/slerp.js'

var dispSlerp = function (elm, platform) {
	const calcSlerp = function () {
		const o = +elm.select('[name=o]').property('value')
		platform.fit((tx, ty) => {
			let model = new Slerp(o)
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

	elm.append('span').text(' o ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'o')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', calcSlerp)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSlerp)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSlerp(platform.setting.ml.configElement, platform)
}
