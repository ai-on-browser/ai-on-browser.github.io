import { getPage } from '../helper/browser'

describe('generate', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const clusters = page.locator('#data_menu input[name=n]')
		await clusters.fill('1')
		const resetDataButton = page.locator('#data_menu input[value=Reset]')
		await resetDataButton.dispatchEvent('click')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('GR')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('diffusion_model')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const iteration = buttons.locator('select:nth-of-type(1)')
		await expect(iteration.inputValue()).resolves.toBe('10')
		const rate = buttons.locator('input:nth-of-type(2)')
		await expect(rate.inputValue()).resolves.toBe('0.01')
		const batch = buttons.locator('input:nth-of-type(3)')
		await expect(batch.inputValue()).resolves.toBe('10')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
		const methodFooter = page.locator('#method_footer', { state: 'attached' })
		await expect(methodFooter.textContent()).resolves.toBe('')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')
		await buttons.locator('input[value=Step]:enabled').waitFor()

		await expect(epoch.textContent()).resolves.toBe('10')
		await expect(methodFooter.textContent()).resolves.toMatch(/^loss/)
	})
})
