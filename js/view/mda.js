import MixtureDiscriminant from '../../lib/model/mda.js'

var dispMDA = function (elm, platform) {
	let model = null
	const calc = cb => {
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			if (!model) {
				const r = +elm.select('[name=r]').property('value')
				model = new MixtureDiscriminant(r)
				model.init(tx, ty)
			}
			model.fit()
			platform.predict((px, pred_cb) => {
				const categories = model.predict(px)
				pred_cb(categories)
			}, 3)
			cb && cb()
		})
	}

	elm.append('span').text(' r ')
	elm.append('input').attr('type', 'number').attr('name', 'r').attr('min', 1).attr('max', 100).attr('value', 10)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMDA(platform.setting.ml.configElement, platform)
}
