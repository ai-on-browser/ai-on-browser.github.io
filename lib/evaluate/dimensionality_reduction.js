/**
 * Returns Co-Ranking Matrix.
 *
 * @param {Array<Array<number>>} x
 * @param {Array<Array<number>>} z
 * @param {number} ks Rank significance
 * @param {number} kt Failure tolerance
 * @returns {number}
 */
export function coRankingMatrix(x, z, ks, kt) {
	// https://qiita.com/ZoneTsuyoshi/items/1c532a3a7bfaf5393e55
	const n = x.length
	const dx = []
	const dz = []
	for (let i = 0; i < n; i++) {
		dx[i] = Array(n).fill(0)
		dz[i] = Array(n).fill(0)
	}
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			dx[i][j] = dx[j][i] = Math.sqrt(x[i].reduce((s, v, k) => s + (v - x[j][k]) ** 2, 0))
			dz[i][j] = dz[j][i] = Math.sqrt(z[i].reduce((s, v, k) => s + (v - z[j][k]) ** 2, 0))
		}
	}

	const rx = []
	const rz = []
	for (let i = 0; i < n; i++) {
		rx[i] = Array(n).fill(0)
		rz[i] = Array(n).fill(0)
		for (let j = 0; j < n; j++) {
			for (let k = 0; k < n; k++) {
				if (dx[i][k] < dx[i][j] || (dx[i][k] === dx[i][j] && k < j)) {
					rx[i][j]++
				}
				if (dz[i][k] < dz[i][j] || (dz[i][k] === dz[i][j] && k < j)) {
					rz[i][j]++
				}
			}
		}
	}

	let q = 0
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			const ws = rx[i][j] > ks && rz[i][j] > ks ? 0 : 1
			const wt = Math.abs(rx[i][j] - rz[i][j]) > kt ? 0 : 1
			q += ws * wt
		}
	}
	return q / (ks * n)
}
