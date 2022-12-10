import Matrix from '../../lib/util/matrix.js'

import MetropolisHastings from '../../lib/model/mh.js'

var dispMH = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Metropolis-Hastings algorithm (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Metropolis%E2%80%93Hastings_algorithm',
	}
	elm.append('select')
		.attr('name', 'distribution')
		.selectAll('option')
		.data(['gaussian'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Sample')
		.on('click', () => {
			const tx = Matrix.fromArray(platform.trainInput)
			const distribution = elm.select('[name=distribution]').property('value')
			let f
			if (distribution === 'gaussian') {
				const mean = tx.mean(0)
				const icov = tx.cov().inv()
				f = x => {
					const x1 = Matrix.fromArray(x.concat())
					x1.sub(mean.t)
					return Math.exp(-x1.tDot(icov).dot(x1).toScaler() / 2)
				}
			}
			const model = new MetropolisHastings(f, tx.cols)
			const s = model.sample(tx.rows)
			platform.trainResult = s
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Sample" button.'
	dispMH(platform.setting.ml.configElement, platform)
}
