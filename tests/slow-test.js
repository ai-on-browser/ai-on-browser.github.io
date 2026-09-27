import path from 'node:path'
import url from 'node:url'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

export default class SlowTestReporter {
	constructor(options = {}) {
		this._options = options
	}

	onTestRunEnd(testModules) {
		const slowTests = []

		for (const testModule of testModules) {
			for (const test of testModule.children.allTests()) {
				const diagnostic = test.diagnostic()
				if (!diagnostic) {
					continue
				}
				slowTests.push({
					duration: diagnostic.duration,
					fullName: test.fullName,
					filePath: testModule.moduleId,
				})
			}
		}

		if (slowTests.length === 0) {
			return
		}

		slowTests.sort((a, b) => b.duration - a.duration)
		const slowestTests = slowTests.slice(0, this._options.numTests || 10)
		const slowTestTime = slowestTests.reduce((total, st) => total + st.duration, 0)
		const allTestTime = slowTests.reduce((total, st) => total + st.duration, 0)
		const percentTime = (slowTestTime / allTestTime) * 100

		console.log(
			`Top ${slowestTests.length} slowest tests (${(slowTestTime / 1000).toFixed(2)} seconds,` +
				` ${percentTime.toFixed(1)}% of total time):`
		)

		for (let i = 0; i < slowestTests.length; i++) {
			const duration = slowestTests[i].duration
			const fullName = slowestTests[i].fullName
			const filePath = slowestTests[i].filePath.slice(filepath.length + 1)

			console.log(`  ${fullName}`)
			console.log(`    ${(duration / 1000).toFixed(2)}s ${filePath}`)
		}
	}
}
