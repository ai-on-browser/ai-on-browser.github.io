import DiscriminantAdaptiveNearestNeighbor from '../../lib/model/dann.js'

var dispDANN = function (elm, platform) {
	const calc = cb => {
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const iter = +elm.select('[name=iter]').property('value')
			const model = new DiscriminantAdaptiveNearestNeighbor()
			model.fit(tx, ty)
			platform.predict((px, pred_cb) => {
				const categories = model.predict(px, iter)
				pred_cb(categories)
			}, 10)
			cb && cb()
		})
	}

	elm.append('span').text(' iteration ')
	elm.append('input').attr('type', 'number').attr('name', 'iter').attr('min', 0).attr('max', 100).attr('value', 1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispDANN(platform.setting.ml.configElement, platform)
}
