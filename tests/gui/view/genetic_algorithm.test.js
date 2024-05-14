import { getPage } from '../helper/browser'

describe('markov decision process', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('')
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('MD')
		const envSelectBox = await page.waitForSelector('#ml_selector #task_menu select')
		await envSelectBox.selectOption('grid')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('genetic_algorithm')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const size = await buttons.waitForSelector('input:first-child')
		await expect(size.getAttribute('value')).resolves.toBe('100')
		const resolution = await buttons.waitForSelector('input:nth-child(2)')
		await expect(resolution.getAttribute('value')).resolves.toBe('20')
		const mutation_rate = await buttons.waitForSelector('input:nth-child(4)')
		await expect(mutation_rate.getAttribute('value')).resolves.toBe('0.001')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		await expect(buttons.textContent()).resolves.toMatch(/Generation: 0/)

		const initializeButton = await buttons.waitForSelector('input[value=Initialize]')
		await initializeButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(buttons.textContent()).resolves.toMatch(/Generation: 1/)
	})
})
