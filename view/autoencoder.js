import { Matrix } from '../js/math.js'

import Autoencoder from '../model/autoencoder.js'

var dispAEClt = function (elm, model, platform) {
	const step = 8

	return cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const rho = +elm.select('[name=rho]').property('value')
		platform.fit((tx, ty, fit_cb) => {
			model.fit(tx, tx, iteration, rate, batch, rho, e => {
				model.reduce(tx, e => {
					let pred = e
					let p_mat = Matrix.fromArray(pred)

					const t_mat = p_mat.argmax(1).value.map(v => v + 1)
					platform.predict((px, pred_cb) => {
						model.reduce(px, e => {
							let tpred = e
							let p_mat = Matrix.fromArray(tpred)
							let categories = p_mat.argmax(1)
							categories.add(1)
							fit_cb(t_mat)
							pred_cb(categories.value)

							cb && cb()
						})
					}, step)
				})
			})
		})
	}
}

var dispAEad = function (elm, model, platform) {
	return cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const rho = +elm.select('[name=rho]').property('value')
		const threshold = +elm.select('[name=threshold]').property('value')

		platform.fit((tx, ty, fit_cb) => {
			model.fit(tx, tx, iteration, rate, batch, rho, e => {
				platform.predict((px, pred_cb) => {
					let pd = [].concat(tx, px)
					model.predict(pd, e => {
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
						fit_cb(outliers)
						pred_cb(outlier_tiles)

						cb && cb()
					})
				}, 4)
			})
		})
	}
}

var dispAEdr = function (elm, model, platform) {
	return cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const rho = +elm.select('[name=rho]').property('value')

		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx, tx, iteration, rate, batch, rho, e => {
				model.reduce(tx, e => {
					pred_cb(e)
					cb && cb()
				})
			})
		})
	}
}

var dispAE = function (elm, platform) {
	const mode = platform.task
	let model = new Autoencoder()
	const fitModel =
		mode == 'AD'
			? dispAEad(elm, model, platform)
			: mode == 'CT'
			? dispAEClt(elm, model, platform)
			: dispAEdr(elm, model, platform)

	if (mode !== 'DR') {
		elm.append('span').text(' Size ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'node_number')
			.attr('value', 10)
			.attr('min', 1)
			.attr('max', 100)
			.property('required', true)
	}
	const builder = new NeuralNetworkBuilder()
	builder.makeHtml(elm, { optimizer: true })
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.init()
		if (platform.datas.length == 0) {
			return
		}
		const rdim = platform.dimension || +elm.select('[name=node_number]').property('value')

		model.initialize(platform.datas.dimension, rdim, builder.layers, builder.invlayers, builder.optimizer)
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
	if (mode == 'AD') {
		elm.append('span').text(' threshold = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'threshold')
			.attr('value', 0.02)
			.attr('min', 0)
			.attr('max', 10)
			.attr('step', 0.01)
	}
	slbConf.step(fitModel).epoch(() => model.epoch)

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispAE(platform.setting.ml.configElement, platform)
}
