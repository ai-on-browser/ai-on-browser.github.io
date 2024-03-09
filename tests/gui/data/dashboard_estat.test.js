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
		await dataSelectBox.selectOption('dashboard_estat')

		const dataMenu = await page.waitForSelector('#ml_selector #data_menu')
		const nameTextBox = await dataMenu.waitForSelector('select[name=name]')
		const name = await (await nameTextBox.getProperty('value')).jsonValue()
		expect(name).toBe('Nikkei Indexes')

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.points .datas circle')
		const size = (await svg.$$('.points .datas circle')).length
		expect(size).toBeGreaterThan(0)

		const aiManager = await getaimanager(page, { ignoreProperties: ['_indicatorMetaInfos'] })
		expect(aiManager._datas).toBeDefined()
		expect(aiManager._datas._x.length).toBe(size)
	})
})
