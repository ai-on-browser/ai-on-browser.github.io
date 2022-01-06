import NormalHERD from '../../lib/model/normal_herd.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispNormalHERD = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const type = elm.select('[name=type]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const model = new EnsembleBinaryModel(NormalHERD, method, null, [type, c])
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
		.attr('name', 'type')
		.selectAll('option')
		.data(['full', 'exact', 'project', 'drop'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' c = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 0.1)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispNormalHERD(platform.setting.ml.configElement, platform)
}
