import { getPage } from '../helper/browser'

describe('reinforcement learning', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('MD')
		const envSelectBox = page.locator('#ml_selector #task_menu select')
		await envSelectBox.selectOption('grid')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('q_learning')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const resolution = buttons.locator('input:nth-of-type(1)')
		await expect(resolution.inputValue()).resolves.toBe('20')
		const greedyrate = buttons.locator('input:nth-of-type(4)')
		await expect(greedyrate.inputValue()).resolves.toBe('0.02')
	})

	test('learn', { retry: 3 }, async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const step = page.locator('[name=step]')
		await expect(step.textContent()).resolves.toBe(' Step: 0')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const calcButton = buttons.locator('input[value=Step]:enabled')
		await calcButton.dispatchEvent('click')

		await expect(step.textContent()).resolves.toBe(' Step: 1')
	})
})
