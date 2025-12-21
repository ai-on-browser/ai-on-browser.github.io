import {
	LinearDiscriminant,
	FishersLinearDiscriminant,
	MulticlassLinearDiscriminant,
	LinearDiscriminantAnalysis,
} from '../../lib/model/lda.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = () => {
		const ty = platform.trainOutput.map(v => v[0])
		if (platform.task === 'CF') {
			let m = null
			if (method.value === 'multiclass') {
				m = new MulticlassLinearDiscriminant()
				m.fit(platform.trainInput, ty)
			} else {
				const model_cls = model.value === 'FLD' ? FishersLinearDiscriminant : LinearDiscriminant
				m = new EnsembleBinaryModel(() => new model_cls(), method.value)
				m.init(platform.trainInput, ty)
				m.fit()
			}
			const categories = m.predict(platform.testInput(3))
			platform.testResult(categories)
		} else {
			const dim = platform.dimension
			let y = new LinearDiscriminantAnalysis(dim).predict(platform.trainInput, ty)
			platform.trainResult = y
		}
	}

	let method = null
	let model = null
	if (platform.task === 'CF') {
		method = controller.select(['oneone', 'onerest', 'multiclass']).on('change', () => {
			model.element.style.display = method.value === 'multiclass' ? 'none' : null
		})
		model = controller.select(['FLD', 'LDA'])
	}
	controller.input.button('Calculate').on('click', calc)
}
