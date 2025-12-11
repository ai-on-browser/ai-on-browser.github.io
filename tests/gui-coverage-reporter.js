import fs from 'fs'
import path from 'path'
import url from 'url'

import { DefaultReporter } from 'vitest/reporters'
import libCoverage from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import reports from 'istanbul-reports'
import v8toIstanbul from 'v8-to-istanbul'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))
const covdir = path.join(path.dirname(filepath), 'coverage')

export default class GUICoverageReporter extends DefaultReporter {
	constructor() {
		super()
		if (!fs.existsSync(covdir)) {
			fs.mkdirSync(covdir)
		}
		if (!fs.existsSync(path.join(covdir, '.gitignore'))) {
			fs.writeFileSync(path.join(covdir, '.gitignore'), '*')
		}
		fs.rmSync(path.join(covdir, 'tests'), { recursive: true, force: true })
	}

	async onTestRunEnd() {
		const targetFiles = await readdirRecursively(path.join(covdir, 'tests'))
		const coverages = []
		await Promise.all(
			targetFiles.map(async file => {
				const body = await fs.promises.readFile(file)
				const cov = JSON.parse(body)
				for (const coverage of cov) {
					coverage.source = (
						await fs.promises.readFile(path.join(path.dirname(filepath), coverage.url))
					).toString()
				}
				coverages.push(...cov)
			})
		)

		const map = libCoverage.createCoverageMap()
		for (const entry of coverages) {
			const converter = v8toIstanbul(entry.url, 0, { source: entry.source })
			await converter.load()
			converter.applyCoverage(entry.functions)
			const data = converter.toIstanbul()
			map.merge(data)
		}
		const context = libReport.createContext({ coverageMap: map, dir: 'coverage' })
		reports.create('lcov').execute(context)
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
const coveredFiles = {}

if (globalThis.afterAll) {
	afterAll(async () => {
		await Promise.all(wholeCoverages.map(({ coverages, test }, i) => makeCoverage(coverages, test, i)))
		await Promise.all(
			Object.keys(coveredFiles).map(async textpath => {
				if (!fs.existsSync(path.dirname(textpath))) {
					await fs.promises.mkdir(path.dirname(textpath), { recursive: true })
				}
				if (!fs.existsSync(textpath)) {
					await fs.promises.writeFile(textpath, coveredFiles[textpath])
				}
			})
		)
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
		.filter(entry => entry.url.startsWith(prefix) && entry.url.endsWith('js'))
		.map(entry => {
			const url = entry.url.slice(prefix.length)
			const textpath = path.join(path.dirname(filepath), url)
			coveredFiles[textpath] = entry.source
			return { url, scriptId: entry.scriptId, functions: entry.functions }
		})
	return fs.promises.writeFile(targetPath, JSON.stringify(targetCoverages))
}
