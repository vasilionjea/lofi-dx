(()=>{"use strict";function e(e){return null==e}function t(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function s(e,s){const n={};for(const r of Object.keys(e))t(s,r)&&(n[r]=e[r]);return n}function n(e){return structuredClone instanceof Function?structuredClone(e):JSON.parse(JSON.stringify(e))}function r(e,t){let s=0,n=e.length-1,r=Math.floor(n/2);for(;e[r]!==t&&s<n;)t<e[r]?n=r-1:s=r+1,r=Math.floor((s+n)/2);if(t===e[r])return e.splice(r,1)[0]}new Map([["[object Undefined]","undefined"],["[object Null]","null"],["[object Boolean]","boolean"],["[object String]","string"],["[object Number]","number"],["[object Array]","array"],["[object Set]","set"],["[object Object]","object"],["[object Map]","map"],["[object Function]","function"],["[object RegExp]","regexp"],["[object Error]","error"]]);const i={a:!0,able:!0,about:!0,above:!0,across:!0,after:!0,again:!0,against:!0,ain:!0,all:!0,am:!0,an:!0,and:!0,any:!0,are:!0,aren:!0,"aren't":!0,as:!0,at:!0,be:!0,because:!0,been:!0,before:!0,being:!0,below:!0,between:!0,both:!0,but:!0,by:!0,can:!0,couldn:!0,"couldn't":!0,d:!0,did:!0,didn:!0,"didn't":!0,do:!0,does:!0,doesn:!0,"doesn't":!0,doing:!0,don:!0,"don't":!0,down:!0,during:!0,each:!0,few:!0,for:!0,from:!0,further:!0,had:!0,hadn:!0,"hadn't":!0,has:!0,hasn:!0,"hasn't":!0,have:!0,haven:!0,"haven't":!0,having:!0,he:!0,her:!0,here:!0,hers:!0,herself:!0,him:!0,himself:!0,his:!0,how:!0,i:!0,if:!0,in:!0,into:!0,is:!0,isn:!0,"isn't":!0,it:!0,"it's":!0,its:!0,itself:!0,just:!0,ll:!0,m:!0,ma:!0,me:!0,mightn:!0,"mightn't":!0,more:!0,most:!0,mustn:!0,"mustn't":!0,my:!0,myself:!0,needn:!0,"needn't":!0,no:!0,nor:!0,not:!0,now:!0,o:!0,of:!0,off:!0,on:!0,once:!0,only:!0,or:!0,other:!0,our:!0,ours:!0,ourselves:!0,out:!0,over:!0,own:!0,re:!0,s:!0,same:!0,shan:!0,"shan't":!0,she:!0,"she's":!0,should:!0,"should've":!0,shouldn:!0,"shouldn't":!0,so:!0,some:!0,such:!0,t:!0,than:!0,that:!0,"that'll":!0,the:!0,their:!0,theirs:!0,them:!0,themselves:!0,then:!0,there:!0,these:!0,they:!0,this:!0,those:!0,through:!0,to:!0,too:!0,under:!0,until:!0,up:!0,ve:!0,very:!0,was:!0,wasn:!0,"wasn't":!0,we:!0,were:!0,weren:!0,"weren't":!0,what:!0,when:!0,where:!0,which:!0,while:!0,who:!0,whom:!0,why:!0,will:!0,with:!0,won:!0,"won't":!0,wouldn:!0,"wouldn't":!0,y:!0,you:!0,"you'd":!0,"you'll":!0,"you're":!0,"you've":!0,your:!0,yours:!0,yourself:!0,yourselves:!0};function o(e){return function(e){return Boolean(i[e])}(e)||!e.match(/(\w+)/g)}function a(e){const t=[];for(const s of e.split(/\s+/g))o(s)||t.push(s);return t.join(" ")}var c;!function(e){e.Invalid="Invalid",e.PresenceTerm="PresenceTerm",e.ExactTerm="ExactTerm",e.Term="Term"}(c||(c={}));const l={[c.PresenceTerm]:/(?<PresenceTerm>(?:(\s+)?([-+]))((\w{2,})|"(?:[^"]+)"))/,[c.ExactTerm]:/(?<ExactTerm>("(?:[^"]+)"))/,[c.Term]:/(?<Term>[^ ]+)/},h=new RegExp(`${l[c.PresenceTerm].source}|${l[c.ExactTerm].source}|${l[c.Term].source}`,"g");class u{constructor(e,t){this.type=e,this.text=t}}class d{constructor(e){this.queryInvalidChars=/(?:[\^*()_}\]\\[{>\\<|\\/`~}]+)/gi,this.queryText=e.replace(this.queryInvalidChars,"")}getTokenType(e={}){let t=c.Invalid;return e.PresenceTerm?t=c.PresenceTerm:e.ExactTerm?t=c.ExactTerm:e.Term&&(t=c.Term),t}tokenize(){const e=[];for(const t of this.queryText.matchAll(h))if(t&&t.groups){const s=this.getTokenType(t.groups),n=(t[0]||"").trim();n&&!o(n)&&e.push(new u(s,n))}return e}}function m(e=""){return e.replace(/\s+/g," ").trim()}function p(e=""){return e.replace(/["]/g,"")}const g=/s$/i,f=/(ss|i?es)$/i;function v(e){const t=[];for(const s of e.split(/\s+/g))g.test(s)&&!f.test(s)?t.push(s.replace(g,"")):t.push(s);return t.join(" ")}var y;!function(e){e[e.Simple=0]="Simple",e[e.Negated=1]="Negated",e[e.Required=2]="Required"}(y||(y={}));class b{constructor(){this.parts=[]}add(e){this.parts.push(e)}}class w{constructor(e){this.tokens=e}parsePresence(e){let t=m(e.text.toLocaleLowerCase()).trim(),s=y.Simple,n=!1;return t.startsWith("-")?s=y.Negated:t.startsWith("+")&&(s=y.Required),t=function(e=""){return e.replace(/^([-+]+)/,"")}(t),t.startsWith('"')&&(t=p(t).trim(),n=!0),t=a(t),t=v(t),{term:t,type:s,isPhrase:n}}parseExact(e){let t=p(e.text.toLocaleLowerCase());return t=m(t).trim(),t=a(t),t=v(t),{term:t,type:y.Simple,isPhrase:!0}}parseSimple(e){return{term:v(e.text.toLocaleLowerCase().trim()),type:y.Simple,isPhrase:!1}}parse(){const e=new b;for(const t of this.tokens){let s;switch(t.type){case c.PresenceTerm:s=this.parsePresence(t);break;case c.ExactTerm:s=this.parseExact(t);break;default:s=this.parseSimple(t)}s.term&&e.add(s)}return e}}function S(e){const t=e.concat(),s=[];if(!t.length)return s;let n=parseInt(t.shift(),36);s.push(n);for(const e of t){const t=n+parseInt(e,36);s.push(t),n=t}return s}function T(e){return`${function(e){const t=[];if(!e.length)return t;for(let s=0;s<e.length;s++){const n=e[s-1],r=e[s];if(0===s)t.push(r.toString(36));else{const e=r-n;t.push(e.toString(36))}}return t}(e.postings).join(",")}`}const x=/\s+/g;class E{get totalDocs(){return this.totalDocuments}constructor(e){this.documentsTable={},this.indexTable={},this.documentTermCounts={},this.totalDocuments=0,this.uidKey=e.uidKey||"id",this.fields=new Set(e.fields),this.documentSplitter=e.splitter||x,this.storageKey=e.storageKey||"search-query:index"}tokenizeText(e){return m(e).toLocaleLowerCase().split(this.documentSplitter)}tokensWithPostings(e){const t=[];let s=0;for(const n of e)if(!o(n)){const e=v(n),r={term:e,posting:s};s+=e.length+1,t.push(r)}return t}index(t){if(e(t)||!(s=t)||!/\S+/g.test(s))return this;var s;this.fields.add(t);for(const e of Object.values(this.documentsTable))this.indexDocument(t,e);return this}indexDocument(t,s){var n;const r=s[this.uidKey];if(e(r)||e(s[t]))return;const i=this.tokensWithPostings(this.tokenizeText(s[t]));this.documentTermCounts[r]+=i.length;for(const e of i){this.indexTable[e.term]||(this.indexTable[e.term]={});const t=this.getDocumentEntry(e.term,r);null===(n=t.postings)||void 0===n||n.push(e.posting),this.indexTable[e.term][r]=T(t)}}addDocuments(t){if(e(t)||!Array.isArray(t))return this;for(const e of t){const t=e[this.uidKey];this.documentsTable[t]||(this.totalDocuments+=1),this.documentsTable[t]=e,this.documentTermCounts[t]=0,this.fields.forEach((t=>this.indexDocument(t,e)))}return this}getDocument(e){return this.documentsTable[e]}getDocumentTermCount(e){return this.documentTermCounts[e]||0}getTermEntry(e){return this.indexTable[e]||{}}getDocumentEntry(e,t,s=!0){const n=this.getTermEntry(e);return s?(r=n[t])?{postings:S(r.split(","))}:{postings:[]}:n[t];var r}toJSON(){return{fields:[...this.fields],documents:[this.totalDocuments,n(this.documentsTable),n(this.documentTermCounts)],index:n(this.indexTable)}}setLoaded({fields:e,documents:t,index:s}){const[n,r,i]=t;this.fields=new Set(e),this.totalDocuments=n,this.documentsTable=r,this.documentTermCounts=i,this.indexTable=s}get isStored(){return Boolean(localStorage.getItem(this.storageKey))}saveStore(){return new Promise(((e,t)=>{try{const t=this.toJSON();localStorage.setItem(this.storageKey,JSON.stringify(t)),e(!0)}catch(e){console.error(e),t(e)}}))}loadStore(){return new Promise(((e,t)=>{const s=localStorage.getItem(this.storageKey);if(s)try{const t=JSON.parse(s);this.setLoaded(t),e(!0)}catch(e){console.error(e),t(e)}else e(!1)}))}clearStore(){return new Promise((e=>{localStorage.removeItem(this.storageKey),e()}))}}function I({frequency:e,totalTerms:t},{totalDocs:s,totalTermDocs:n}){const r=function(e,t){return e/t}(e,t),i=function(e,t){return Math.log(e/t)}(s,n);return r*i}class j{constructor(e){this.invertedIndex=e}matchesWithScores(e){const t={},s=Object.entries(e),n=this.invertedIndex.totalDocs,r=s.length;for(const[e,i]of s){const s=this.invertedIndex.getDocumentTermCount(e),o=i.split(",").length;t[e]=I({frequency:o,totalTerms:s},{totalDocs:n,totalTermDocs:r})}return t}sumScores(...e){return e.reduce(((e=0,t=0)=>Number((e+t).toFixed(6))))}assignScores(e,s,n=!1){for(const[r,i]of Object.entries(s))n?t(e,r)&&(e[r]=this.sumScores(e[r],i)):e[r]=this.sumScores(e[r],i)}getSimpleMatches(e){const t=e&&this.invertedIndex.getTermEntry(e.term);return this.matchesWithScores(t)}getRequiredMatches(e){let t={};for(let n=0;n<e.length;n++){const r=e[n],i=r.isPhrase?this.getPhraseMatches(r):this.getSimpleMatches(r);if(!i){t={};break}if(0===n)t=i;else{const e=s(t,i);this.assignScores(e,i,!0),t=e}}return t}searchPhrase({candidates:t,terms:n}){const i={},o=n.length,a={};for(const s of Object.keys(t)){for(const e of n){const t=this.invertedIndex.getDocumentEntry(e,s);a[e]=t.postings}let t=0;const c=[a[n[0]].shift()];for(;c.length&&!e(n[t+1])&&i[s]!==o;){0===t&&(i[s]=1);const o=c[c.length-1]+n[t].length+1,l=r(a[n[t+1]],o);if(e(l)){t=0,c.length=0;const s=a[n[0]].shift();e(s)||c.push(s)}else c.push(l),i[s]+=1,t++}i[s]!==o&&delete i[s]}return s(t,i)}getPhraseMatches(e){const t=e.term.split(/\s+/);if(1===t.length)return this.getSimpleMatches(e);const s=this.getRequiredMatches(t.map((e=>({term:e,isPhrase:!1}))));return this.searchPhrase({terms:t,candidates:s})}getMatches(e){const t={};for(const s of e){const e=s.isPhrase?this.getPhraseMatches(s):this.getSimpleMatches(s);s.type===y.Negated?Object.assign(t,e):this.assignScores(t,e)}return t}result(e,s){const n=function(e,s){const n={};for(const r of Object.keys(e))t(s,r)||(n[r]=e[r]);return n}(e,s);return Object.keys(n).sort(((e,t)=>n[t]-n[e])).map((e=>this.invertedIndex.getDocument(e)))}search(e){const t=function(e){const t={required:[],negated:[],simple:[]};for(const s of e)switch(s.type){case y.Required:t.required.push(s);break;case y.Negated:t.negated.push(s);break;case y.Simple:t.simple.push(s)}return t}(function(e=""){if(!e)return new b;const t=new d(e).tokenize();return new w(t).parse()}(e).parts),s=this.getMatches(t.negated);return t.required.length?this.result(this.getRequiredMatches(t.required),s):this.result(this.getMatches(t.simple),s)}}const C=new class{constructor(){this.invertedIndex=new E({uidKey:"id",fields:["body"],splitter:/\W+|\d+/g}),this.invertedSearch=new j(this.invertedIndex)}async fetch(){const e=performance.now(),t=await fetch("./data.json"),{data:s}=await t.json();this.invertedIndex.addDocuments(s);const n=performance.now();console.log(`Loaded (fetch + index): ${n-e}ms`)}async loadStore(){const e=performance.now();await this.invertedIndex.loadStore();const t=performance.now();console.log(`Loaded (localstorage): ${t-e}ms`)}async loadDocuments(){this.invertedIndex.isStored?await this.loadStore():(await this.fetch(),this.invertedIndex.saveStore()),console.log(this.invertedIndex.toJSON())}search(e=""){if(e.length<=1)return;const t=performance.now(),s=this.invertedSearch.search(e),n=performance.now();return console.log(`Search took ${n-t} milliseconds.`),s}},L=e=>document.querySelector(e);class P extends Event{constructor(e){super("statechange"),this.state=e}}class k extends EventTarget{constructor(e={}){super(),this.value=e}setState(e){this.value=e,this.dispatchEvent(new P(this.value))}getState(){return this.value}}class q extends EventTarget{get tagName(){return"div"}get classNames(){return[]}constructor(e={}){super(),this.settings={},this.settings=Object.assign(Object.assign({},this.settings),e),this._createElement()}_createElement(){this.settings.element||(this.element=document.createElement(this.tagName)),this.element.classList.add(...this.classNames)}destroy(){this.element.remove(),this.element=this.settings=null}}class D extends q{get classNames(){return["search-input"]}onInputChange(){this.input.value?this.dispatchInput():this.dispatchClear()}dispatchInput(){const e=new CustomEvent("input:value",{bubbles:!0,detail:{value:this.input.value}});this.dispatchEvent(e)}dispatchClear(){const e=new CustomEvent("input:clear",{bubbles:!0});this.dispatchEvent(e)}setValue(e){this.input&&(this.input.value=e,this.onInputChange())}reset(){var e;this.setValue(""),this.dispatchClear(),null===(e=this.input)||void 0===e||e.focus()}clearIconTemplate(){let e='<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false" style="pointer-events: none; display: block; width: inherit; height: inherit">';return e+='<g><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></g>','<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false" style="pointer-events: none; display: block; width: inherit; height: inherit"><g><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></g></svg>'}template(){const e="searchInput";let t=`<label id="prompt" for="${e}" class="visuallyhidden">Search national parks</label>`;return t+=`<input type="search" id="${e}" placeholder="Search for something..." aria-labelledby="prompt" autocorrect="off" spellcheck="false" autocapitalize="off">`,t+=`<button class="btn btn-icon btn-clear" aria-label="Clear search">${this.clearIconTemplate()}</button>`,t}render(){return this.element.insertAdjacentHTML("beforeend",this.template()),this.input=this.element.querySelector("input"),this.input.addEventListener("input",(()=>this.onInputChange())),this.clearButton=this.element.querySelector(".btn-clear"),this.clearButton.addEventListener("click",(e=>this.reset())),this}}const M="expanded";class N extends q{get classNames(){return["search-results"]}constructor(){super(),this.element.addEventListener("click",this)}resultsTemplate(e){return e.reduce(((e,t)=>e+`<article>${t.title}${t.body}</article>`),"")}querySuggestions(){let e='<div class="query-suggestions">';return e+="<p>Suggestions</p>",e+="<ul>",e+='<li class="pill pill--outlined">camping waterfalls -Teton</li>',e+='<li class="pill pill--outlined">"sierra nevada" +mojave</li>',e+='<li class="pill pill--outlined">southwestern Utah</li>',e+="</ul>",'<div class="query-suggestions"><p>Suggestions</p><ul><li class="pill pill--outlined">camping waterfalls -Teton</li><li class="pill pill--outlined">"sierra nevada" +mojave</li><li class="pill pill--outlined">southwestern Utah</li></ul></div>'}noResultsTemplate(){let e='<div class="no-results">';return e+="<p>No results found :(</p>",e+=this.querySuggestions(),e+"</div>"}toggle(e,t){t.classList.contains(M)?(t.classList.remove(M),e.textContent="read more"):(t.classList.add(M),e.textContent="read less")}handleEvent(e){const t=e.target;t.classList.contains("see-more")&&this.toggle(t,t.parentElement)}render(e=[]){return this.element.innerHTML=e?e.length?this.resultsTemplate(e):this.noResultsTemplate():"",this}}new class extends k{constructor(e){super(),this.appService=e,this.$header=L("header"),this.$main=L("main"),this.$stats=L(".search-stats"),this.searchInput=new D,this.searchResults=new N,this.debouncedSearch=function(e,t=0,s){let n=null;return(...r)=>{n&&window.clearTimeout(n),n=window.setTimeout((()=>e.apply(s,r)),t)}}(this.search,150,this),this.addEventListener("statechange",this)}async start(){this.$header.prepend(this.searchInput.render().element),this.$main.append(this.searchResults.element);try{await this.appService.loadDocuments(),this.searchInput.addEventListener("input:value",this),this.searchInput.addEventListener("input:clear",this),this.searchInput.setValue('"sierra nevada" california')}catch(e){console.error(e)}}search(e){const t=this.appService.search(e);this.setState({results:t})}handleEvent(e){const{type:t,detail:s}=e;"input:value"===t&&this.debouncedSearch(s.value),"input:clear"===t&&this.setState({results:null}),"statechange"===t&&this.renderResults()}renderResults(){const{results:e}=this.getState();this.searchResults.render(e),this.renderStats(e)}renderStats(e){let t="";if(!e)return void(this.$stats.textContent=t);const s=e.length;0===s?t="no results found":1===s?t="1 result found":s>1&&(t=`${s} results found`),this.$stats.textContent=t}}(C).start()})();