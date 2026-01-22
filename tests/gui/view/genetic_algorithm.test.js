import { getPage } from '../helper/browser'

describe('markov decision process', () => {
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
		await modelSelectBox.selectOption('genetic_algorithm')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const size = buttons.locator('input:first-child')
		await expect(size.inputValue()).resolves.toBe('100')
		const resolution = buttons.locator('input:nth-child(2)')
		await expect(resolution.inputValue()).resolves.toBe('20')
		const mutation_rate = buttons.locator('input:nth-child(4)')
		await expect(mutation_rate.inputValue()).resolves.toBe('0.001')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		await buttons.locator('input[value=Initialize]').waitFor()
		await expect(buttons.textContent()).resolves.toMatch(/Generation: 0/)

		const initializeButton = buttons.locator('input[value=Initialize]')
		await initializeButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		await expect(buttons.textContent()).resolves.toMatch(/Generation: 1/)
	})
})
