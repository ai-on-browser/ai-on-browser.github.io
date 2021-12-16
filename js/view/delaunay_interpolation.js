import DelaunayInterpolation from '../../lib/model/delaunay_interpolation.js'

var dispDelaunay = function (elm, platform) {
	const calc = function () {
		platform.fit((tx, ty) => {
			let model = new DelaunayInterpolation()
			model.fit(
				tx.map(v => [v[0], v[1]]),
				ty.map(v => v[0])
			)
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => [v[0], v[1]]))
				cb(pred.map(v => v ?? -1))
			}, 1)
		})
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate". This model works with 2D data only.'
	dispDelaunay(platform.setting.ml.configElement, platform)
}
