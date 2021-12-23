import SmoothingSpline from '../../lib/model/spline.js'

var dispSpline = function (elm, platform) {
	const calcSpline = function () {
		const l = +lmb.property('value')
		platform.fit((tx, ty) => {
			let model = new SmoothingSpline(l)
			const data = tx.map(v => v[0])
			model.fit(
				data,
				ty.map(v => v[0])
			)
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 2)
		})
	}

	const lmb = elm
		.append('input')
		.attr('type', 'number')
		.attr('name', 'lambda')
		.attr('min', 0)
		.attr('value', 0.01)
		.attr('step', 0.01)
		.on('change', calcSpline)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSpline)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispSpline(platform.setting.ml.configElement, platform)
}
