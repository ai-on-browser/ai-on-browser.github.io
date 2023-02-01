import RDF from '../../lib/model/rdf.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: ' D. Ren, B. Wang, W. Perrizo',
		title: 'RDF: a density-based outlier detection method using vertical data representation',
		year: 2004,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new RDF(r.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v > t.value)
	}

	const r = controller.input.number({ label: ' Radius ', min: 0, max: 100, step: 0.1, value: 0.1 }).on('change', calc)
	const t = controller.input.number({ label: ' Threshold ', min: 0, max: 10, step: 0.1, value: 2 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
