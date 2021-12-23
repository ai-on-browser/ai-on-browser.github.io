import PassingBablok from '../../lib/model/passing_bablok.js'

var dispPB = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const model = new PassingBablok()
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px.map(v => v[0])))
			}, 1)
		})
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispPB(platform.setting.ml.configElement, platform)
}
