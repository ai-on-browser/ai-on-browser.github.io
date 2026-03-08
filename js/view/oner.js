import OneR from '../../lib/model/oner.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)

	const discrete = controller.input.number({ label: ' discrete = ', min: 2, max: 100, value: 10 })
	controller.input.button('Fit').on('click', () => {
		let tx = platform.trainInput
		const model = new OneR()
		const x = Matrix.fromArray(tx)
		const max = x.max()
		const min = x.min()
		tx = tx.map(r => r.map(v => Math.floor(((v - min) / (max - min)) * discrete.value)))
		model.fit(
			tx,
			platform.trainOutput.map(v => v[0])
		)
		const px = platform.testInput(10).map(r => r.map(v => Math.floor(((v - min) / (max - min)) * discrete.value)))
		const pred = model.predict(px)
		platform.testResult(pred.map(v => (v ? +v : -1)))
	})
}
