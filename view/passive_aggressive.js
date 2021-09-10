import PA from '../lib/model/passive_aggressive.js'
import EnsembleBinaryModel from '../lib/util/ensemble.js'

var dispPA = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const version = +elm.select('[name=version]').property('value')
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const model = new EnsembleBinaryModel(PA, method, null, [version])
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
		.attr('name', 'version')
		.selectAll('option')
		.data([
			['PA', 0],
			['PA-1', 1],
			['PA-2', 2],
		])
		.enter()
		.append('option')
		.property('value', d => d[1])
		.text(d => d[0])
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispPA(platform.setting.ml.configElement, platform)
}
