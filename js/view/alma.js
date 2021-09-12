import ALMA from '../../lib/model/alma.js'
import EnsembleBinaryModel from '../../lib/util/ensemble.js'

var dispALMA = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const p = +elm.select('[name=p]').property('value')
			const alpha = +elm.select('[name=alpha]').property('value')
			const b = +elm.select('[name=b]').property('value')
			const c = +elm.select('[name=c]').property('value')
			const model = new EnsembleBinaryModel(ALMA, method, null, [p, alpha, b, c])
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
	elm.append('span').text(' p = ')
	elm.append('input').attr('type', 'number').attr('name', 'p').attr('min', 1).attr('max', 100).attr('value', 2)
	elm.append('span').text(' alpha = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 1)
		.attr('step', 0.1)
	elm.append('span').text(' b = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'b')
		.attr('min', 0)
		.attr('max', 100)
		.attr('value', 1)
		.attr('step', 0.1)
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
	dispALMA(platform.setting.ml.configElement, platform)
}
