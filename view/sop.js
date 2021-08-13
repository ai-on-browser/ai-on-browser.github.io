import SecondOrderPerceptron from '../model/sop.js'

var dispSOP = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const a = +elm.select('[name=a]').property('value')
			const model = new EnsembleBinaryModel(SecondOrderPerceptron, method, null, [a])
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
	elm.append('span').text(' a = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'a')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 1)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSOP(platform.setting.ml.configElement, platform)
}
