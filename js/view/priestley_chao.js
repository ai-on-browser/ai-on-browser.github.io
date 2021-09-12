import PriestleyChao from '../../lib/model/priestley_chao.js'

var dispPriestleyChao = function (elm, platform) {
	const fitModel = () => {
		const s = +sgm.property('value')
		const auto = autoCheck.property('checked')
		platform.fit((tx, ty) => {
			const model = new PriestleyChao(auto ? null : s)
			model.fit(tx, ty)
			if (auto) {
				sgm.property('value', model._h)
			}

			platform.predict(
				(px, pred_cb) => {
					const pred = model.predict(px)
					pred_cb(pred)
				},
				platform.datas.dimension === 1 ? 1 : 4
			)
		})
	}

	elm.append('span').text('auto')
	const autoCheck = elm
		.append('input')
		.attr('type', 'checkbox')
		.attr('name', 'auto')
		.property('checked', true)
		.on('change', () => {
			sgm.property('disabled', autoCheck.property('checked'))
		})
	const sgm = elm
		.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.attr('min', 0)
		.attr('value', 0.1)
		.attr('step', 0.01)
		.property('disabled', true)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispPriestleyChao(platform.setting.ml.configElement, platform)
}
