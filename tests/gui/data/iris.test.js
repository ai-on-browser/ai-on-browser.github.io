import getaimanager from '../helper/aimanager'
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
		await dataSelectBox.selectOption('uci')

		const dataMenu = await page.waitForSelector('#ml_selector #data_menu')
		const nameSelect = await dataMenu.waitForSelector('select[name=name]')
		const name = await (await nameSelect.getProperty('value')).jsonValue()
		expect(name).toBe('iris')

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.points .datas circle')
		expect((await svg.$$('.points .datas circle')).length).toBe(150)

		const aiManager = await getaimanager(page)
		expect(aiManager._datas).toBeDefined()
		expect(aiManager._datas._x.length).toBe(150)
	})
})
