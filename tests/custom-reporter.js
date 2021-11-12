import path from 'path'

const filename = path.resolve('.')

class CustomReporter {
	constructor(globalConfig, options) {
		this._globalConfig = globalConfig
		this._options = options
	}

	onRunComplete(contexts, results) {
		for (const testResult of results.testResults) {
            const filePath = testResult.testFilePath.slice(filename.length + 1)
            for (const test of testResult.testResults) {
                if (test.invocations > 1) {
                    console.log(`${filePath} ${test.fullName} retries ${test.invocations - 1} time(s).`)
                }
            }
		}
	}
}

export default CustomReporter
