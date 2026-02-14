import AssociationAnalysis from '../../lib/model/association_analysis.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		model = new AssociationAnalysis(minSupport.value)
		const feature_names = platform.datas._feature_names
		const tx = platform.trainInput.map(r => {
			return r.map((v, i) => `${feature_names[i]}:${v}`)
		})
		model.fit(tx)
		const items = [...model.items()].map(v => v[0])
		items.sort()
		elma.values = items
		elmb.values = items
		calcRel()
	}

	const calcRel = () => {
		if (!model) {
			return
		}
		const a = elma.value
		const b = elmb.value
		support.value = `a=${model.support(a)}, b=${model.support(b)}, a&b=${model.support(a, b)}`
		confidence.value = model.confidence(a, b)
		lift.value = model.lift(a, b)
	}

	const minSupport = controller.input.number({
		label: 'min support',
		min: 0,
		max: 1,
		step: 0.1,
		value: 0.1,
	})
	controller.input.button('Fit').on('click', fitModel)
	const elma = controller.select([]).on('change', calcRel)
	controller.text(' => ')
	const elmb = controller.select([]).on('change', calcRel)
	controller.text(' support: ')
	const support = controller.text(0)
	controller.text(' confidence: ')
	const confidence = controller.text(0)
	controller.text(' lift: ')
	const lift = controller.text(0)
}
