import NAROW from '../../lib/model/narow.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispNAROW = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const b = +elm.select('[name=b]').property('value')
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const model = new EnsembleBinaryModel(function () {
				return new NAROW(b)
			}, method)
			model.init(tx, ty)
			model.fit()

			platform.predict((px, pred_cb) => {
				const categories = model.predict(px)
				pred_cb(categories)
				cb && cb()
			}, 3)
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['oneone', 'onerest'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' b = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'b')
		.attr('min', 0)
		.attr('max', 100)
		.attr('value', 20)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispNAROW(platform.setting.ml.configElement, platform)
}
