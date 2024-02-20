import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('poke')

		const dataMenu = await page.waitForSelector('#ml_selector #data_menu')
		const statusElm = await dataMenu.waitForSelector('span[name=status]')
		const status = await statusElm.innerText()
		expect(status).toBe('No data')
	})
})
