import { Matrix } from '../util/math.js'

const LSA = function (x, rd = 0) {
	// https://qiita.com/Hatomugi/items/d6c8bb1a049d3a84feaa
	x = Matrix.fromArray(x)
	const [u, s, v] = x.svd()
	return u
		.sliceCol(0, rd)
		.dot(Matrix.diag(s.slice(0, rd)))
		.dot(v.slice(0, 0, rd, rd).t)
}

export default LSA
