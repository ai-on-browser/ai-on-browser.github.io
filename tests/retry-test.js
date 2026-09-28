import path from 'node:path'
import url from 'node:url'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

export default class RetryTestReporter {
	onTestRunEnd(testModules) {
		const retryTests = []

		for (const testModule of testModules) {
			for (const test of testModule.children.allTests()) {
				const diagnostic = test.diagnostic()
				const retryCount = diagnostic?.retryCount ?? 0
				if (retryCount > 0) {
					retryTests.push({
						invocations: retryCount + 1,
						fullName: test.fullName,
						filePath: testModule.moduleId,
					})
				}
			}
		}

		if (retryTests.length === 0) {
			return
		}

		retryTests.sort((a, b) => b.invocations - a.invocations)
		console.log('Retry tests')
		for (const test of retryTests) {
			console.log(`  ${test.fullName}`)
			console.log(`    retry ${test.invocations - 1} time(s) ${test.filePath.slice(filepath.length + 1)} `)
		}
	}
}
