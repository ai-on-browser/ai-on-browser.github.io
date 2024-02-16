var c=Object.defineProperty;var d=(l,e)=>c(l,"name",{value:e,configurable:!0});import p from"./csv.js";const r={boston:{file:"/js/data/csv/boston.csv.gz",info:[{name:"CRIM",title:"per capita crime rate by town"},{name:"ZN",title:"proportion of residential land zoned for lots over 25,000 sq.ft."},{name:"INDUS",title:"proportion of non-retail business acres per town"},{name:"CHAS",title:"Charles River dummy variable (= 1 if tract bounds river; 0 otherwise)"},{name:"NOX",title:"nitric oxides concentration (parts per 10 million)"},{name:"RM",title:"average number of rooms per dwelling"},{name:"AGE",title:"proportion of owner-occupied units built prior to 1940"},{name:"DIS",title:"weighted distances to five Boston employment centres"},{name:"RAD",title:"index of accessibility to radial highways"},{name:"TAX",title:"full-value property-tax rate per $10,000"},{name:"PTRATIO",title:"pupil-teacher ratio by town"},{name:"B",title:"1000(Bk - 0.63)^2 where Bk is the proportion of blacks by town"},{name:"LSTAT",title:"% lower status of the population"},{name:"MEDV",title:"Median value of owner-occupied homes in $1000's",out:!0}],credit:"The Boston house-price data of Harrison, D. and Rubinfeld, D.L. 'Hedonic prices and the demand for clean air', J. Environ. Economics & Management,vol.5, 81-102, 1978."},houses:{file:"/js/data/csv/houses.csv.gz",info:[{name:"median house value",out:!0},{name:"median income"},{name:"housing median age"},{name:"total rooms"},{name:"total bedrooms"},{name:"population"},{name:"households"},{name:"latitude"},{name:"longitude"}],credit:"Pace, R. Kelley and Ronald Barry, Sparse Spatial Autoregressions, Statistics and Probability Letters, 33 (1997) 291-297."}};export default class h extends p{static{d(this,"MarketingData")}constructor(e){super(e),this._name="boston";const t=this.setting.data.configElement,a=document.createElement("div");a.style.display="flex",a.style.justifyContent="space-between",t.appendChild(a);const o=document.createElement("span");a.appendChild(o),o.append("Name");const n=document.createElement("select");n.name="name",n.onchange=()=>{this._name=n.value,this._readyData(),this.setting.pushHistory()};for(const m of Object.keys(r)){const s=document.createElement("option");s.value=s.innerText=m,n.appendChild(s)}o.appendChild(n);const i=document.createElement("a");a.appendChild(i),i.href="http://lib.stat.cmu.edu/datasets/",i.setAttribute("ref","noreferrer noopener"),i.target="_blank",i.innerText="StatLib---Datasets Archive",this._credit=document.createElement("span"),this._credit.style.fontSize="80%",t.appendChild(this._credit),this._readyData()}get availTask(){return["RG"]}get params(){return{dataname:this._name}}set params(e){if(e.dataname&&Object.keys(r).includes(e.dataname)){const t=this.setting.data.configElement;this._name=e.dataname,t.querySelector("[name=name]").value=e.dataname,this._readyData()}}_readyData(){const e=this._name,t=r[e];this.readCSV(t.file,{delimiter:","}).then(a=>{e===this._name&&(this._credit.innerText=t.credit,this.setCSV(a,t.info),this._manager.onReady(()=>{this._manager.platform.render()}))})}}
