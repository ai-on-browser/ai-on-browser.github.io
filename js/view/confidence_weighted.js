import { ConfidenceWeighted, SoftConfidenceWeighted } from '../../lib/model/confidence_weighted.js'
import EnsembleBinaryModel from '../../lib/util/ensemble.js'

var dispConfidenceWeighted = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const type = elm.select('[name=type]').property('value')
		const eta = +elm.select('[name=eta]').property('value')
		const cost = +elm.select('[name=cost]').property('value')
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const mdl = type === 'cw' ? ConfidenceWeighted : SoftConfidenceWeighted
			const prm = type === 'cw' ? [eta] : [eta, cost, type === 'scw-1' ? 1 : 2]
			const model = new EnsembleBinaryModel(mdl, method, null, prm)
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
		.on('change', function () {
			const type = d3.select(this).property('value')
			if (type === 'cw') {
				celm.style('display', 'none')
			} else {
				celm.style('display', 'inline')
			}
		})
		.selectAll('option')
		.data(['cw', 'scw-1', 'scw-2'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	const celm = elm.append('span').style('display', 'none')
	celm.append('span').text(' cost = ')
	celm.append('input').attr('type', 'number').attr('name', 'cost').attr('min', 0).attr('max', 100).attr('value', 1)
	elm.append('span').text(' eta = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'eta')
		.attr('min', 0.5)
		.attr('max', 1)
		.attr('value', 0.9)
		.attr('step', 0.01)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispConfidenceWeighted(platform.setting.ml.configElement, platform)
}
