import getaimanager from '../helper/aimanager'
import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('eurostat')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const dataMenu = page.locator('#ml_selector #data_menu')
		const themeList = dataMenu.locator('div:first-child')

		const svg = page.locator('#plot-area svg')
		await svg.locator('.points .datas circle').first().waitFor()
		const size = await svg.locator('.points .datas circle').count()
		expect(size).toBeGreaterThan(0)

		const aiManager = await getaimanager(page, {
			ignoreProperties: ['_catalogue', '_metabase'],
		})
		expect(aiManager._datas).toBeDefined()
		expect(aiManager._datas._x.length).toBe(size)

		const nameTextBox = themeList.locator('select').last()
		await expect(nameTextBox.inputValue()).resolves.toBe('nama_10_pe')
	})
})
