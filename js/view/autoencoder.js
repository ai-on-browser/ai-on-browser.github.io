import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class AutoencoderWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/autoencoder_worker.js', { type: 'module' })
	}

	initialize(input_size, reduce_size, enc_layers, dec_layers, optimizer) {
		return this._postMessage({ mode: 'init', input_size, reduce_size, enc_layers, dec_layers, optimizer })
	}

	fit(train_x, iteration, rate, batch, rho) {
		return this._postMessage({ mode: 'fit', x: train_x, iteration, rate, batch, rho }).then(r => r.data)
	}

	predict(x) {
		return this._postMessage({ mode: 'predict', x: x })
	}

	reduce(x) {
		return this._postMessage({ mode: 'reduce', x: x }).then(r => r.data)
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const mode = platform.task
	const controller = new Controller(platform)
	const model = new AutoencoderWorker()
	let epoch = 0
	const fitModel = async () => {
		if (mode === 'AD') {
			const tx = platform.trainInput
			const fite = await model.fit(tx, +iteration.value, rate.value, batch.value, rho.value)
			platform.plotLoss(fite.loss)
			const px = platform.testInput(4)
			let pd = [].concat(tx, px)
			const e = await model.predict(pd)
			let pred = e.data.slice(0, tx.length)
			let pred_tile = e.data.slice(tx.length)
			let d = tx[0].length

			const outliers = []
			for (let i = 0; i < pred.length; i++) {
				let v = 0
				for (let k = 0; k < d; k++) {
					v += (pred[i][k] - tx[i][k]) ** 2
				}
				outliers.push(v > threshold.value)
			}
			const outlier_tiles = []
			for (let i = 0; i < pred_tile.length; i++) {
				let v = 0
				for (let k = 0; k < d; k++) {
					v += (pred_tile[i][k] - px[i][k]) ** 2
				}
				outlier_tiles.push(v > threshold.value)
			}
			platform.trainResult = outliers
			platform.testResult(outlier_tiles)

			epoch = fite.epoch
		} else if (mode === 'CT') {
			const step = 8
			const fite = await model.fit(platform.trainInput, +iteration.value, rate.value, batch.value, rho.value)
			platform.plotLoss(fite.loss)
			let p_mat = Matrix.fromArray(await model.reduce(platform.trainInput))

			const t_mat = p_mat.argmax(1).value.map(v => v + 1)
			let tp_mat = Matrix.fromArray(await model.reduce(platform.testInput(step)))
			let categories = tp_mat.argmax(1)
			categories.add(1)
			platform.trainResult = t_mat
			platform.testResult(categories.value)

			epoch = fite.epoch
		} else {
			const fite = await model.fit(platform.trainInput, +iteration.value, rate.value, batch.value, rho.value)
			platform.plotLoss(fite.loss)
			platform.trainResult = await model.reduce(platform.trainInput)
			epoch = fite.epoch
		}
	}

	let rdim = null
	if (mode !== 'DR') {
		rdim = controller.input.number({ label: ' Size ', min: 1, max: 100, value: 10 })
	}
	const builder = new NeuralNetworkBuilder()
	builder.makeHtml(platform.setting.ml.configElement, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(done => {
		platform.init()
		if (platform.datas.length === 0) {
			done()
			return
		}
		const rd = rdim?.value ?? platform.dimension

		model.initialize(platform.datas.dimension, rd, builder.layers, builder.invlayers, builder.optimizer).then(done)
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	const rho = controller.input.number({ label: ' Sparse rho ', min: 0, max: 1, step: 0.01, value: 0.02 })
	let threshold = null
	if (mode === 'AD') {
		threshold = controller.input.number({ label: ' threshold = ', min: 0, max: 10, step: 0.01, value: 0.02 })
	}
	slbConf.step(() => fitModel()).epoch(() => epoch)

	return () => {
		model.terminate()
	}
}
