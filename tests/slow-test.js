import path from 'node:path'
import url from 'node:url'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

class JestSlowTestReporter {
	constructor(globalConfig, options) {
		this._globalConfig = globalConfig
		this._options = options
		this._slowTests = []
	}

	onRunComplete() {
		console.log()
		this._slowTests.sort((a, b) => b.duration - a.duration)
		const slowestTests = this._slowTests.slice(0, this._options.numTests || 10)
		const slowTestTime = slowestTests.reduce((total, st) => total + st.duration, 0)
		const allTestTime = this._slowTests.reduce((total, st) => total + st.duration, 0)
		const percentTime = (slowTestTime / allTestTime) * 100

		console.log(
			`Top ${slowestTests.length} slowest tests (${slowTestTime / 1000} seconds,` +
				` ${percentTime.toFixed(1)}% of total time):`
		)

		for (let i = 0; i < slowestTests.length; i++) {
			const duration = slowestTests[i].duration
			const fullName = slowestTests[i].fullName
			const filePath = slowestTests[i].filePath.slice(filepath.length + 1)

			console.log(`  ${fullName}`)
			console.log(`    ${duration / 1000}s ${filePath}`)
		}
	}

	onTestResult(test, testResult) {
		for (const test of testResult.testResults) {
			this._slowTests.push({
				duration: test.duration,
				fullName: test.fullName,
				filePath: testResult.testFilePath,
			})
		}
	}
}

export default JestSlowTestReporter
