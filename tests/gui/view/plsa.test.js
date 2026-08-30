import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const preprocessSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(8) select')
		await preprocessSelectBox.selectOption('discrete')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('plsa')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const topics = buttons.locator('input:nth-of-type(1)')
		await expect(topics.inputValue()).resolves.toBe('5')
		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		await expect(epoch.textContent()).resolves.toBe('1')
	})
})
