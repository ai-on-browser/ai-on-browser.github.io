import { ExtraTreesClassifier, ExtraTreesRegressor } from '../../lib/model/extra_trees.js'

var dispExtraTrees = function (elm, platform) {
	const mode = platform.task
	let tree = null
	let step = 4

	const dispRange = function () {
		platform.predict(
			(px, pred_cb) => {
				let pred = tree.predict(px)
				pred_cb(pred)
			},
			step,
			1
		)
	}

	elm.append('span').text(' Tree #')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'tree_num')
		.property('value', 50)
		.attr('min', 1)
		.attr('max', 200)
	elm.append('span').text(' Sampling rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'srate')
		.property('value', 1)
		.attr('min', 0.1)
		.attr('max', 1)
		.attr('step', 0.1)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Initialize')
		.on('click', () => {
			if (platform.datas.length === 0) {
				tree = null
				elm.select('[name=depthnumber]').text('0')
				return
			}
			const tree_num = +elm.select('input[name=tree_num]').property('value')
			const srate = +elm.select('input[name=srate]').property('value')
			if (mode === 'CF') {
				tree = new ExtraTreesClassifier(tree_num, srate)
			} else {
				tree = new ExtraTreesRegressor(tree_num, srate)
			}
			platform.fit((tx, ty) => {
				tree.init(
					tx,
					ty.map(v => v[0])
				)
			})
			dispRange()

			elm.select('[name=depthnumber]').text(tree.depth)
		})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Separate')
		.on('click', () => {
			if (!tree) {
				return
			}
			tree.fit()

			dispRange()

			elm.select('[name=depthnumber]').text(tree.depth)
		})
	elm.append('span').attr('name', 'depthnumber').text('0')
	elm.append('span').text(' depth ')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Separate".'
	dispExtraTrees(platform.setting.ml.configElement, platform)
}
