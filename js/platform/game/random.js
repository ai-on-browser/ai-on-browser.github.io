export default class RandomPlayer{constructor(){}set turn(t){this._turn=t}action(t,o){const s=t.choices(this._turn),e=s[Math.floor(Math.random()*s.length)];setTimeout((()=>{o(e)}),100)}close(){}}