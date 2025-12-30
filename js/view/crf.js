import CRF from '../../lib/model/crf.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	let model = null
	let epoch = 0
	const fitModel = () => {
		let tx = platform.trainInput
		if (!model) {
			model = new CRF()
		}
		const x = Matrix.fromArray(tx)
		const max = x.max()
		const min = x.min()
		tx = tx.map(r => r.map(v => Math.floor(((v - min) / (max - min)) * discrete.value)))
		for (let i = 0; i < iteration.value; i++) {
			model.fit(
				tx,
				platform.trainOutput.map(v => Array(x.cols).fill(v[0]))
			)
		}
		epoch += iteration.value
		const px = platform.testInput(10).map(r => r.map(v => Math.floor(((v - min) / (max - min)) * discrete.value)))
		const pred = model.predict(px)
		platform.testResult(pred.map(v => v[0] ?? -1))
	}

	const discrete = controller.input.number({ label: ' discrete = ', min: 2, max: 100, value: 10 })
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	const iteration = controller.input.number({ label: ' iteration ', min: 1, max: 1000, value: 1 })
	slbConf.step(fitModel).epoch(() => epoch)
}
