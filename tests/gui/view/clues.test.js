import puppeteer from 'puppeteer'

import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('clues')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const alpha = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await alpha.getProperty('value')).jsonValue()).resolves.toBe('0.05')
		const clusters = await buttons.waitForSelector('span:last-child')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('clues')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span:last-child')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('')

		const stepButton = await buttons.waitForSelector('input[value=Fit]')
		await stepButton.evaluate(el => el.click())

		const clusterCount = await clusters.evaluate(el => el.textContent)

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.datas circle')
		const circles = await svg.$$('.datas circle')
		const colors = new Set()
		for (const circle of circles) {
			const fill = await circle.evaluate(el => el.getAttribute('fill'))
			colors.add(fill)
		}
		expect(colors.size).toBeGreaterThanOrEqual(+clusterCount)
	}, 10000)
})
