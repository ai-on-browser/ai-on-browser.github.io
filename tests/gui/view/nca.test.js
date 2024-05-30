import { getPage } from '../helper/browser'

describe('dimensionality reduction', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('DR')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('nca')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const lr = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(lr.getAttribute('value')).resolves.toBe('0.1')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(epoch.textContent()).resolves.toBe('1')

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile circle')
		const circles = await svg.$$('.tile circle')
		expect(circles).toHaveLength(300)
	})
})
