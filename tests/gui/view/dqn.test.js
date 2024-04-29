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
		await modelSelectBox.selectOption('dqn')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const method = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await method.getProperty('value')).jsonValue()).resolves.toBe('full')
		const greedyrateLB = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(greedyrateLB.getAttribute('value')).resolves.toBe('0.01')
		const greedyrateInit = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect(greedyrateInit.getAttribute('value')).resolves.toBe('1')
		const greedyrateRate = await buttons.waitForSelector('input:nth-of-type(5)')
		await expect(greedyrateRate.getAttribute('value')).resolves.toBe('0.995')
		const learningRate = await buttons.waitForSelector('input:nth-of-type(6)')
		await expect(learningRate.getAttribute('value')).resolves.toBe('0.001')
		const size = await buttons.waitForSelector('input:nth-of-type(7)')
		await expect(size.getAttribute('value')).resolves.toBe('10')
	})

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('')
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('MD')
		const envSelectBox = await page.waitForSelector('#ml_selector #task_menu select')
		await envSelectBox.selectOption('grid')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('dqn')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const step = await page.waitForSelector('[name=step]')
		await expect(step.evaluate(el => el.textContent)).resolves.toBe(' Step: 0')

		const calcButton = await buttons.waitForSelector('input[value=Step]')
		await calcButton.evaluate(el => el.click())

		await expect(step.evaluate(el => el.textContent)).resolves.toBe(' Step: 1')
	})
})
