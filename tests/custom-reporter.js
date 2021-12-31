import path from 'path'
import url from 'url'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

class CustomReporter {
	constructor(globalConfig, options) {
		this._globalConfig = globalConfig
		this._options = options
	}

	onRunComplete(contexts, results) {
		for (const testResult of results.testResults) {
			const filePath = testResult.testFilePath.slice(filepath.length + 1)
			for (const test of testResult.testResults) {
				if (test.invocations > 1) {
					console.log(`${filePath} ${test.fullName} retries ${test.invocations - 1} time(s).`)
				}
			}
		}
	}
}

export default CustomReporter
