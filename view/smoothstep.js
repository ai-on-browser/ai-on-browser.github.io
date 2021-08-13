import SmoothstepInterpolation from '../model/smoothstep.js'

var dispSmoothstep = function (elm, platform) {
	const calcSmoothstep = function () {
		const n = +elm.select('[name=n]').property('value')
		platform.fit((tx, ty) => {
			let model = new SmoothstepInterpolation(n)
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

	elm.append('span').text(' n ')
	elm.append('input').attr('type', 'number').attr('name', 'n').attr('value', 1).attr('min', 0).attr('max', 100)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSmoothstep)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSmoothstep(platform.setting.ml.configElement, platform)
}
