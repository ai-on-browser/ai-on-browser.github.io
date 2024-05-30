import { getPage } from '../helper/browser'

describe('anomaly detection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('hr_diagram')

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('AD')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('ocsvm')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const nu = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(nu.getAttribute('value')).resolves.toBe('0.5')
		const kernel = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await kernel.getProperty('value')).jsonValue()).resolves.toBe('gaussian')
		const gamma = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect(gamma.getAttribute('value')).resolves.toBe('0.1')
		const iteration = await buttons.waitForSelector('select:nth-of-type(2)')
		await expect((await iteration.getProperty('value')).jsonValue()).resolves.toBe('1')
		const threshold = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect(threshold.getAttribute('value')).resolves.toBe('0.6')
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
	})
})
