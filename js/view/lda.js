import {
	LinearDiscriminant,
	FishersLinearDiscriminant,
	MulticlassLinearDiscriminant,
	LinearDiscriminantAnalysis,
} from '../../lib/model/lda.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispLDA = function (elm, platform) {
	const calc = () => {
		const ty = platform.trainOutput.map(v => v[0])
		if (platform.task === 'CF') {
			const method = elm.select('[name=method]').property('value')
			const model = elm.select('[name=model]').property('value')
			let m = null
			if (method === 'multiclass') {
				m = new MulticlassLinearDiscriminant()
				m.fit(platform.trainInput, ty)
			} else {
				const model_cls = model === 'FLD' ? FishersLinearDiscriminant : LinearDiscriminant
				m = new EnsembleBinaryModel(model_cls, method)
				m.init(platform.trainInput, ty)
				m.fit()
			}
			const categories = m.predict(platform.testInput(3))
			platform.testResult(categories)
		} else {
			const dim = platform.dimension
			let y = new LinearDiscriminantAnalysis().predict(platform.trainInput, ty, dim)
			platform.trainResult = y
		}
	}

	if (platform.task === 'CF') {
		elm.append('select')
			.attr('name', 'method')
			.on('change', () => {
				const method = elm.select('[name=method]').property('value')
				elm.select('[name=model]').style('display', method === 'multiclass' ? 'none' : null)
			})
			.selectAll('option')
			.data(['oneone', 'onerest', 'multiclass'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
		elm.append('select')
			.attr('name', 'model')
			.selectAll('option')
			.data(['FLD', 'LDA'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	}
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLDA(platform.setting.ml.configElement, platform)
}
