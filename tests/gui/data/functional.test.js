import getaimanager from '../helper/aimanager'
import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('functional')

		const dataMenu = await page.waitForSelector('#ml_selector #data_menu')
		const dimensionTextBox = await dataMenu.waitForSelector('input[name=dim]')
		const dimension = await (await dimensionTextBox.getProperty('value')).jsonValue()
		expect(dimension).toBe('1')

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.points .datas circle')
		expect((await svg.$$('.points .datas circle')).length).toBe(100)

		const aiManager = await page.evaluate(getaimanager)
		expect(aiManager._datas).toBeDefined()
		expect(aiManager._datas._x.length).toBe(100)
	}, 10000)
})
