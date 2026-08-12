import { getPage } from '../helper/browser'

describe('word embedding', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('text')
		const svg = page.locator('#plot-area svg')
		await svg.locator('.points circle').waitFor()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('WE')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('word_to_vec')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const method = buttons.locator('select').first()
		await expect(method.inputValue()).resolves.toBe('CBOW')
		const n = buttons.locator('input:nth-of-type(1)')
		await expect(n.inputValue()).resolves.toBe('1')
		const iteration = buttons.locator('select').nth(1)
		await expect(iteration.inputValue()).resolves.toBe('1')
		const rate = buttons.locator('input:nth-of-type(3)')
		await expect(rate.inputValue()).resolves.toBe('0.001')
		const batch = buttons.locator('input:nth-of-type(4)')
		await expect(batch.inputValue()).resolves.toBe('10')
	})

	test('learn', { retry: 3 }, async () => {
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

		await expect(epoch.textContent()).resolves.toBe('1')
		await expect(methodFooter.textContent()).resolves.toMatch(/^loss/)
	})
})
