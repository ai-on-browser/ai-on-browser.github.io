import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'
import { MLPClassifier, MLPRegressor } from '../../lib/model/mlp.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const mode = platform.task
	let model = null

	const fitModel = () => {
		const dim = getInputDim()

		let tx = platform.trainInput
		let ty = platform.trainOutput
		const x = Matrix.fromArray(tx)
		if (mode === 'TP') {
			ty = tx.slice(dim)
			tx = []
			for (let i = 0; i < x.rows - dim; i++) {
				tx.push(x.slice(i, i + dim).value)
			}
		}
		if (mode === 'CF') {
			ty = ty.map(v => v[0])
		}
		const loss = model.fit(tx, ty, +iteration.value, rate.value, batch.value)
		platform.plotLoss(loss)
		if (mode === 'TP') {
			let lx = x.slice(x.rows - dim).value
			const p = []
			while (true) {
				if (p.length >= predCount.value) {
					platform.trainResult = p
					return
				}
				const data = model.predict([lx])
				p.push(data[0])
				lx = lx.slice(x.cols)
				lx.push(...data[0])
			}
		} else {
			const data = model.predict(platform.testInput(dim === 1 ? 2 : 4))
			platform.testResult(data)
		}
	}

	const getInputDim = () => {
		return mode === 'TP' ? width.value : platform.datas.dimension || 2
	}

	let width = null
	if (mode === 'TP') {
		width = controller.input.number({ label: 'window width', min: 1, max: 1000, value: 20 })
	}

	const hidden_sizes = controller.array({
		label: ' Hidden Layers ',
		type: 'number',
		values: [10],
		default: 10,
		min: 1,
		max: 100,
	})
	const activation = controller.select({
		label: ' Activation ',
		values: ['sigmoid', 'tanh', 'relu', 'elu', 'leaky_relu', 'gaussian', 'softplus', 'softsign', 'identity'],
	})

	const slbConf = controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}

		if (mode === 'CF') {
			model = new MLPClassifier(hidden_sizes.value, activation.value)
		} else {
			model = new MLPRegressor(hidden_sizes.value, activation.value)
		}
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => model.epoch)
	let predCount
	if (mode === 'TP') {
		predCount = controller.input.number({ label: ' predict count', min: 1, max: 1000, value: 100 })
	} else {
		predCount = controller.input({ type: 'hidden', value: 0 })
	}
}
