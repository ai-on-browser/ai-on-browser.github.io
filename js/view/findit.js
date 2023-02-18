import FINDIT from '../../lib/model/findit.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'K. G. Woo, J. H. Lee, M. H. Kim, Y. J. Lee',
		title: 'FINDIT: a fast and intelligent subspace clustering algorithm using dimension voting',
		year: 2004,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new FINDIT(minsize.value, mindist.value)

		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput).map(v => v + 1)
		platform.trainResult = pred
		const tilePred = model.predict(platform.testInput(4))
		platform.testResult(tilePred.map(v => (v < 0 ? -1 : v + 1)))
		clusters.value = model.size
	}

	const minsize = controller.input.number({ label: ' minsize ', min: 1, max: 1000, value: 10 })
	const mindist = controller.input.number({ label: ' mindist ', min: 1, max: 1000, value: 2 })
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
