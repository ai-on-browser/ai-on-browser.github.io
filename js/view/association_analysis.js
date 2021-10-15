import AssociationAnalysis from '../../lib/model/association_analysis.js'

var dispAA = function (elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, _, pred_cb) => {
			const support = +elm.select('[name=support]').property('value')
			model = new AssociationAnalysis(support)
			const feature_names = platform.datas._feature_names
			tx = tx.map(r => {
				return r.map((v, i) => feature_names[i] + ':' + v)
			})
			model.fit(tx)
			const items = [...model.items()].map(v => v[0])
			items.sort()
			elma.selectAll('*').remove()
			elma.selectAll('option')
				.data(items)
				.enter()
				.append('option')
				.attr('value', d => d)
				.text(d => d)
			elmb.selectAll('*').remove()
			elmb.selectAll('option')
				.data(items)
				.enter()
				.append('option')
				.attr('value', d => d)
				.text(d => d)
			calcRel()
		})
	}

	const calcRel = () => {
		if (!model) {
			return
		}
		const a = elma.property('value')
		const b = elmb.property('value')
		support.text(`a=${model.support(a)}, b=${model.support(b)}, a&b=${model.support(a, b)}`)
		confidence.text(model.confidence(a, b))
		lift.text(model.lift(a, b))
	}

	elm.append('span').text('min support')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'support')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
		.attr('value', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	const elma = elm.append('select').on('change', calcRel)
	elm.append('span').text(' => ')
	const elmb = elm.append('select').on('change', calcRel)
	elm.append('span').text(' support: ')
	const support = elm.append('span').text(0)
	elm.append('span').text(' confidence: ')
	const confidence = elm.append('span').text(0)
	elm.append('span').text(' lift: ')
	const lift = elm.append('span').text(0)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispAA(platform.setting.ml.configElement, platform)
}
