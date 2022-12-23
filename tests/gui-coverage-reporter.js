import cp from 'child_process'
import fs from 'fs'
import path from 'path'
import url from 'url'

import pti from 'puppeteer-to-istanbul'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))
const covdir = path.join(path.dirname(filepath), 'coverage-gui')

export default class GUICoverageReporter {
	constructor(globalConfig, options) {
		this._globalConfig = globalConfig
		this._options = options

		if (!fs.existsSync(covdir)) {
			fs.mkdirSync(covdir)
		}
		if (!fs.existsSync(path.join(covdir, '.gitignore'))) {
			fs.writeFileSync(path.join(covdir, '.gitignore'), '*')
		}
		fs.rmSync(path.join(covdir, 'tests'), { recursive: true, force: true })
	}

	async onRunComplete() {
		const targetFiles = await readdirRecursively(path.join(covdir, 'tests'))
		const coverages = []
		await Promise.all(
			targetFiles.map(async file => {
				const body = await fs.promises.readFile(file)
				const cov = JSON.parse(body)
				for (const coverage of cov) {
					coverage.text = await fs.promises.readFile(path.join(path.dirname(filepath), coverage.url))
				}
				coverages.push(...cov)
			})
		)
		pti.write(coverages, { includeHostname: true, storagePath: `./.nyc_output` })
		await new Promise((resolve, reject) => {
			cp.exec('nyc report --reporter=lcov --report-dir=./coverage-gui', (err, stdout, stderr) => {
				if (err) {
					reject(err)
				} else {
					resolve(stdout)
				}
			})
		})
	}
}

const readdirRecursively = async dir => {
	const files = []
	for (const cld of await fs.promises.readdir(dir)) {
		const joindPath = path.join(dir, cld)
		const stats = await fs.promises.stat(joindPath)
		if (stats.isDirectory()) {
			files.push(...(await readdirRecursively(joindPath)))
		} else {
			files.push(joindPath)
		}
	}
	return files
}

const wholeCoverages = []

if (globalThis.afterAll) {
	afterAll(async () => {
		await Promise.all(wholeCoverages.map(({ coverages, test }, i) => makeCoverage(coverages, test, i)))
	}, 60000)
}

export const recordCoverage = async page => {
	await page.coverage.startJSCoverage({
		resetOnNavigation: false,
	})
	const orgPageClose = page.close.bind(page)
	const testStatus = expect.getState()
	page.close = async () => {
		const coverages = await page.coverage.stopJSCoverage()
		wholeCoverages.push({ coverages, test: testStatus })
		await orgPageClose()
	}
}

const makeCoverage = async (coverages, testStatus, i) => {
	const targetPath = path.join(covdir, testStatus.testPath.slice(path.dirname(filepath).length + 1)) + `_${i}.json`
	if (!fs.existsSync(path.dirname(targetPath))) {
		await fs.promises.mkdir(path.dirname(targetPath), { recursive: true })
	}
	const prefix = `http://${process.env.SERVER_HOST}/`
	const targetCoverages = coverages
		.filter(coverage => coverage.url.startsWith(prefix) && coverage.url.endsWith('js'))
		.map(coverage => {
			const url = coverage.url.slice(prefix.length)
			const textpath = path.join(path.dirname(filepath), url)
			if (!fs.existsSync(path.dirname(textpath))) {
				fs.mkdirSync(path.dirname(textpath), { recursive: true })
			}
			if (!fs.existsSync(textpath)) {
				fs.writeFileSync(textpath, coverage.text)
			}
			return { url, ranges: coverage.ranges }
		})
	return fs.promises.writeFile(targetPath, JSON.stringify(targetCoverages))
}
