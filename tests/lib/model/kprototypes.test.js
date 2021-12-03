import KPrototypes from '../../../lib/model/kprototypes.js'

test('predict', () => {
	const iscat = [true, false, true, false, true]
	const model = new KPrototypes(0.5, iscat)
	const n = 50
	const x = []
	for (let i = 0; i < n; i++) {
		const xi = []
		for (let k = 0; k < 5; k++) {
			if (iscat[k]) {
				const r = Math.floor(Math.random() * 10)
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
			} else {
				xi[k] = Math.random() * 2
			}
		}
		x.push(xi)
	}
	for (let i = 0; i < n; i++) {
		const xi = []
		for (let k = 0; k < 5; k++) {
			if (iscat[k]) {
				const r = Math.floor(Math.random() * 10 + 9)
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
			} else {
				xi[k] = Math.random() * 2 + 2
			}
		}
		x.push(xi)
	}

	model.add(x)
	model.add(x)

	for (let i = 0; i < 100; i++) {
		const d = model.fit(x)
		if (d === 0) {
			break
		}
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	let acc = 0
	const expCls = []
	for (let k = 0; k < x.length / n; k++) {
		const counts = {}
		let max_count = 0
		let max_cls = null
		for (let i = k * n; i < (k + 1) * n; i++) {
			counts[y[i]] = (counts[y[i]] || 0) + 1
			if (max_count < counts[y[i]]) {
				max_count = counts[y[i]]
				max_cls = y[i]
			}
		}
		acc += max_count

		expCls[k] = max_cls
		for (let t = 0; t < k; t++) {
			expect(max_cls).not.toBe(expCls[t])
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.9)
})
