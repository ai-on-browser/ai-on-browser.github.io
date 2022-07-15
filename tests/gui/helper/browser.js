import puppeteer from 'puppeteer'

/** @type {puppeteer.Browser} */
let browser

afterAll(async () => {
	await browser?.close()
})

export const getBrowser = async () => {
	if (!browser) {
		browser = await puppeteer.launch({ args: ['--no-sandbox'] })
	}
	return browser
}

export const getPage = async () => {
	const browser = await getBrowser()
	const page = await browser.newPage()
	await page.goto(`http://${process.env.SERVER_HOST}/`)
	page.on('console', message => console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
		.on('pageerror', ({ message }) => console.log(message))
		.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
	await page.waitForSelector('#data_menu > *')
	return page
}
