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

var dispAEClt = function (elm, model, platform) {
	const step = 8

	return async cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const rho = +elm.select('[name=rho]').property('value')
		const fite = await model.fit(platform.trainInput, iteration, rate, batch, rho)
		platform.plotLoss(fite.loss)
		let p_mat = Matrix.fromArray(await model.reduce(platform.trainInput))

		const t_mat = p_mat.argmax(1).value.map(v => v + 1)
		let tp_mat = Matrix.fromArray(await model.reduce(platform.testInput(step)))
		let categories = tp_mat.argmax(1)
		categories.add(1)
		platform.trainResult = t_mat
		platform.testResult(categories.value)

		cb && cb(fite.epoch)
	}
}

var dispAEad = function (elm, model, platform) {
	return async cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const rho = +elm.select('[name=rho]').property('value')
		const threshold = +elm.select('[name=threshold]').property('value')

		const tx = platform.trainInput
		const fite = await model.fit(tx, iteration, rate, batch, rho)
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
			outliers.push(v > threshold)
		}
		const outlier_tiles = []
		for (let i = 0; i < pred_tile.length; i++) {
			let v = 0
			for (let k = 0; k < d; k++) {
				v += (pred_tile[i][k] - px[i][k]) ** 2
			}
			outlier_tiles.push(v > threshold)
		}
		platform.trainResult = outliers
		platform.testResult(outlier_tiles)

		cb && cb(fite.epoch)
	}
}

var dispAEdr = function (elm, model, platform) {
	return async cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const rho = +elm.select('[name=rho]').property('value')

		const fite = await model.fit(platform.trainInput, iteration, rate, batch, rho)
		platform.plotLoss(fite.loss)
		platform.trainResult = await model.reduce(platform.trainInput)
		cb && cb(fite.epoch)
	}
}

var dispAE = function (elm, platform) {
	const mode = platform.task
	const controller = new Controller(platform)
	const model = new AutoencoderWorker()
	let epoch = 0
	const fitModel =
		mode === 'AD'
			? dispAEad(elm, model, platform)
			: mode === 'CT'
			  ? dispAEClt(elm, model, platform)
			  : dispAEdr(elm, model, platform)

	let rdim = null
	if (mode !== 'DR') {
		rdim = controller.input.number({ label: ' Size ', min: 1, max: 100, value: 10 })
	}
	const builder = new NeuralNetworkBuilder()
	builder.makeHtml(elm, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(done => {
		platform.init()
		if (platform.datas.length === 0) {
			done()
			return
		}
		const rd = rdim?.value ?? platform.dimension

		model.initialize(platform.datas.dimension, rd, builder.layers, builder.invlayers, builder.optimizer).then(done)
	})
	elm.append('span').text(' Iteration ')
	elm.append('select')
		.attr('name', 'iteration')
		.selectAll('option')
		.data([1, 10, 100, 1000, 10000])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rate')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.01)
		.attr('value', 0.001)
	elm.append('span').text(' Batch size ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'batch')
		.attr('value', 10)
		.attr('min', 1)
		.attr('max', 100)
		.attr('step', 1)
	elm.append('span').text(' Sparse rho ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rho')
		.attr('value', 0.02)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.01)
	if (mode === 'AD') {
		elm.append('span').text(' threshold = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'threshold')
			.attr('value', 0.02)
			.attr('min', 0)
			.attr('max', 10)
			.attr('step', 0.01)
	}
	slbConf
		.step(cb => {
			fitModel(e => {
				epoch = e
				cb && cb()
			})
		})
		.epoch(() => epoch)

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispAE(platform.setting.ml.configElement, platform)
}
