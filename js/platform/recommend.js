import{BasePlatform}from"./base.js";import TableRenderer from"../renderer/table.js";export default class RecommendPlatform extends BasePlatform{constructor(e){super(e),this._renderer.push(new TableRenderer(e)),this.setting.render.selectItem("table")}get trainInput(){return this.datas.originalX.map((e=>e.filter((e=>null!==e))))}set trainResult(e){this._pred=e}testInput(){return this.datas.x}testResult(e){this._pred=e}init(){this._renderer.forEach((e=>e.init())),this.render()}terminate(){this.setting.task.configElement.replaceChildren(),this.setting.footer.innerText="",super.terminate()}}