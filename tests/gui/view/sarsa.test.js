import { getPage } from '../helper/browser'

describe('reinforcement learning', () => {
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
		await dataSelectBox.selectOption('')
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('MD')
		const envSelectBox = await page.waitForSelector('#ml_selector #task_menu select')
		await envSelectBox.selectOption('grid')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('sarsa')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const resolution = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(resolution.getAttribute('value')).resolves.toBe('20')
		const greedyrate = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect(greedyrate.getAttribute('value')).resolves.toBe('0.02')
	})

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('')
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('MD')
		const envSelectBox = await page.waitForSelector('#ml_selector #task_menu select')
		await envSelectBox.selectOption('grid')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('sarsa')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const step = await page.waitForSelector('[name=step]')
		await expect(step.evaluate(el => el.textContent)).resolves.toBe(' Step: 0')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const calcButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await calcButton.evaluate(el => el.click())

		await expect(step.evaluate(el => el.textContent)).resolves.toBe(' Step: 1')
	})
})
