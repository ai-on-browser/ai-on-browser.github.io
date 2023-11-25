import playwright from 'playwright'

import { recordCoverage } from '../../gui-coverage-reporter.js'

/** @type {playwright.Browser} */
let browser

afterAll(async () => {
	await browser?.close()
})

export const getBrowser = async () => {
	if (!browser) {
		browser = await playwright.chromium.launch({ args: ['--no-sandbox'] })
	}
	return browser
}

export const getPage = async queries => {
	const browser = await getBrowser()
	const page = await browser.newPage()
	await recordCoverage(page)
	let url = `http://${process.env.SERVER_HOST}/`
	if (queries) {
		const urlparams = new URLSearchParams(queries)
		url += '?' + urlparams.toString()
	}
	await page.goto(url)
	page.on('console', message => console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
		.on('pageerror', ({ message }) => console.log(message))
		.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
	await page.waitForSelector('#data_menu > *')
	return page
}
