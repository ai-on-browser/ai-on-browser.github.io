import {
	LinearDiscriminant,
	FishersLinearDiscriminant,
	MulticlassLinearDiscriminant,
	LinearDiscriminantAnalysis,
} from '../lib/model/lda.js'
import EnsembleBinaryModel from '../lib/util/ensemble.js'

var dispLDA = function (elm, platform) {
	const calc = cb => {
		platform.fit((tx, ty, pred_cb) => {
			ty = ty.map(v => v[0])
			if (platform.task === 'CF') {
				const method = elm.select('[name=method]').property('value')
				const model = elm.select('[name=model]').property('value')
				let m = null
				if (method === 'multiclass') {
					m = new MulticlassLinearDiscriminant()
					m.fit(tx, ty)
				} else {
					const model_cls = model === 'FLD' ? FishersLinearDiscriminant : LinearDiscriminant
					m = new EnsembleBinaryModel(model_cls, method)
					m.init(tx, ty)
					m.fit()
				}
				platform.predict((px, pred_cb) => {
					const categories = m.predict(px)
					pred_cb(categories)
				}, 3)
			} else {
				const dim = platform.dimension
				let y = LinearDiscriminantAnalysis(tx, ty, dim)
				pred_cb(y.toArray())
			}
			cb && cb()
		})
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
