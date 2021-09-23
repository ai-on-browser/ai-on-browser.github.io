import { DecisionTreeClassifier, DecisionTreeRegression } from '../../lib/model/decision_tree.js'

import RandomForest from '../../lib/model/random_forest.js'

var dispRandomForest = function (elm, platform) {
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

	const methods = mode === 'CF' ? ['CART', 'ID3'] : ['CART']
	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(methods)
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
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
		.property('value', 0.2)
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
				const method = elm.select('[name=method]').property('value')
				tree = new RandomForest(tree_num, srate, DecisionTreeClassifier, [method])
			} else {
				tree = new RandomForest(tree_num, srate, DecisionTreeRegression)
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
	dispRandomForest(platform.setting.ml.configElement, platform)
}
