import PLS from '../model/pls.js'

var dispPLS = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const l = +elm.select('[name=l]').property('value')
			const model = new PLS(l)
			model.init(tx, ty)
			model.fit()

			platform.predict(
				(px, pred_cb) => {
					const pred = model.predict(px)
					pred_cb(pred)
				},
				dim === 1 ? 100 : 4
			)
		})
	}

	elm.append('span').text(' l = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'l')
		.attr('min', 1)
		.attr('max', platform.datas.dimension)
		.attr('value', platform.datas.dimension)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPLS(platform.setting.ml.configElement, platform)
}
