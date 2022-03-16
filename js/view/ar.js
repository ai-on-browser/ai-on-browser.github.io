import AR from '../../lib/model/ar.js'

var dispAR = function (elm, platform) {
	const fitModel = () => {
		const method = elm.select('[name=method]').property('value')
		const p = +elm.select('[name=p]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new AR(p, method)
			const pred = []
			for (let i = 0; i < c; pred[i++] = []);
			for (let d = 0; d < tx[0].length; d++) {
				const xd = tx.map(v => v[d])
				model.fit(xd)
				const p = model.predict(xd, c)
				for (let i = 0; i < pred.length; i++) {
					pred[i][d] = p[i]
				}
			}
			pred_cb(pred)
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['lsm', 'yuleWalker', 'levinson', 'householder'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text('p')
	elm.append('input').attr('type', 'number').attr('name', 'p').attr('min', 1).attr('max', 1000).attr('value', 1)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text('predict count')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 100)
		.on('change', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispAR(platform.setting.ml.configElement, platform)
	platform.setting.ml.detail = `
The model form is
$$
x_t = \\sum_{k=1}^p a_k x_{t - k} + \\epsilon_t.
$$
`
}
