import path from 'node:path'
import url from 'node:url'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

class JestRetryTestReporter {
	constructor(globalConfig, options) {
		this._globalConfig = globalConfig
		this._options = options

		this._retryTests = []
	}

	onRunComplete() {
		if (this._retryTests.length === 0) {
			return
		}
		this._retryTests.sort((a, b) => b.invocations - a.invocations)
		console.log()
		console.log('Retry tests')
		for (const test of this._retryTests) {
			console.log(`  ${test.fullName}`)
			console.log(`    retry ${test.invocations - 1} time(s) ${test.filePath.slice(filepath.length + 1)} `)
		}
	}

	onTestResult(test, testResult) {
		for (const test of testResult.testResults) {
			if (test.invocations > 1) {
				this._retryTests.push({
					invocations: test.invocations,
					fullName: test.fullName,
					filePath: testResult.testFilePath,
				})
			}
		}
	}
}

export default JestRetryTestReporter
