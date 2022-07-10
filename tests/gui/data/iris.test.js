import puppeteer from 'puppeteer'

import getaimanager from '../helper/aimanager'

/** @type {puppeteer.Browser} */
let browser
beforeAll(async () => {
	browser = await puppeteer.launch({ args: ['--no-sandbox'] })
})

afterAll(async () => {
	await browser.close()
})

describe('classification', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await browser.newPage()
		await page.goto(`http://${process.env.SERVER_HOST}/`)
		page.on('console', message => console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
			.on('pageerror', ({ message }) => console.log(message))
			.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
		await page.waitForSelector('#data_menu > *')
	}, 10000)

	test('initialize', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		dataSelectBox.select('uci')

		const dataMenu = await page.waitForSelector('#ml_selector #data_menu')
		const nameSelect = await dataMenu.waitForSelector('select[name=name]')
		const name = await (await nameSelect.getProperty('value')).jsonValue()
		expect(name).toBe('iris')

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.points .datas circle')
		expect((await svg.$$('.points .datas circle')).length).toBe(150)

		const aiManager = await page.evaluate(getaimanager)
		expect(aiManager._datas).toBeDefined()
		expect(aiManager._datas._x.length).toBe(150)
	}, 10000)
})