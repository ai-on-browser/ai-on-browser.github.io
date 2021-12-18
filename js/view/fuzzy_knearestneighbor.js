import FuzzyKNN from '../../lib/model/fuzzy_knearestneighbor.js'

var dispFuzzyKNN = function (elm, platform) {
	const calc = function () {
		if (platform.datas.length === 0) {
			return
		}
		const k = +elm.select('[name=k]').property('value')
		const m = +elm.select('[name=m]').property('value')
		platform.fit((tx, ty) => {
			let model = new FuzzyKNN(k, m)
			model.fit(
				tx,
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				const pred = model.predict(px).map(p => p.reduce((s, v) => (s.value > v.value ? s : v), p[0]).label)
				pred_cb(pred)
			}, 4)
		})
	}

	elm.append('span').text(' k = ')
	elm.append('input').attr('type', 'number').attr('name', 'k').attr('value', 5).attr('min', 1).attr('max', 100)
	elm.append('span').text(' m = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'm')
		.attr('value', 2)
		.attr('min', 1.1)
		.attr('max', 10)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispFuzzyKNN(platform.setting.ml.configElement, platform)
}
