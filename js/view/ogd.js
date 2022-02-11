import OnlineGradientDescent from '../../lib/model/ogd.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispOGD = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const loss = elm.select('[name=loss]').property('value')
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const c = +elm.select('[name=c]').property('value')
			const model = new EnsembleBinaryModel(function () {
				return new OnlineGradientDescent(c, loss)
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
	elm.append('select')
		.attr('name', 'loss')
		.selectAll('option')
		.data(['zero_one'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' c = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 0)
		.attr('max', 100)
		.attr('value', 1)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispOGD(platform.setting.ml.configElement, platform)
}
