import QuadraticDiscriminant from '../../lib/model/quadratic_discriminant.js'

var dispQuadraticDiscriminant = function (elm, platform) {
	const calc = cb => {
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const m = new QuadraticDiscriminant()
			m.fit(tx, ty)
			platform.predict((px, pred_cb) => {
				const categories = m.predict(px)
				pred_cb(categories)
				cb && cb()
			}, 3)
		})
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispQuadraticDiscriminant(platform.setting.ml.configElement, platform)
}
