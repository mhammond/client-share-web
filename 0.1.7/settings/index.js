/*
 blade/func Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
 blade/object Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
 blade/jig Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
 blade/array Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
 blade/url Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT, GPL or new BSD license.
 see: http://github.com/jrburke/blade for details
*/
define("blade/fn",[],function(){var f=Array.prototype.slice,b=Object.prototype.toString;return{is:function(d){return b.call(d)==="[object Function]"},bind:function(d,a){if(!a)return d;if(typeof a==="string")a=d[a];var c=f.call(arguments,2);return function(){return a.apply(d,c.concat(f.call(arguments,0)))}}}});
define("blade/object",["./fn"],function(f){function b(){}var d={},a=function(c,e,h){c=c||{};var j,m=a.create(c.prototype,e);c=function(p,x,n){return m[x].apply(p,n)};e=a.create(m);a.mixin(e,f.is(h)?h(c):h,true);j=function(){if(!(this instanceof j))throw new Error('blade/object: constructor function called without "new" in front');this.init&&this.init.apply(this,arguments)};j.prototype=e;return j};a.create=function(c,e){b.prototype=c;c=new b;var h,j;b.prototype=null;if(e)for(h=0;j=e[h];h++)a.mixin(c,
j);return c};a.mixin=function(c,e,h){for(var j in e)if(!(j in d)&&(!(j in c)||h))c[j]=e[j]};return a});
define("blade/jig",["require","./object"],function(f,b){function d(g){return E.call(g)==="[object Array]"}function a(g,i,k){i=i;var l,o;for(l=0;i&&(o=g[l]);l++)i=typeof i==="object"&&o in i?i[o]:k&&l===0&&o in k?k[o]:undefined;return i}function c(g){return g?parseInt(g,10):0}function e(g,i,k){var l=/\[([\w0-9\.'":]+)\]/,o=g,v=i,q=true,w,A;if(g===t)return i;if(y.test(g))return c(g);if(g==="")return"";w=g.charAt(0);if(w==="'"||w==="'")return g.substring(1,g.length-1);if((w=g.indexOf("("))!==-1){l=g.lastIndexOf(")");
q=g.substring(0,w);o=k.fn[q];if(!o){n.error("Cannot find function named: "+q+" for "+g);return""}q=g.substring(w+1,l);if(q.indexOf(",")!==-1){q=q.split(",");for(v=q.length-1;v>=0;v--)q[v]=e(q[v],i,k);o=o.apply(null,q)}else o=o(e(q,i,k));if(l<g.length-1){if(g.charAt(l+1)===".")l+=1;return e(g.substring(l+1,g.length),o,k)}else return o}for(;w=l.exec(o);){i=w[1].replace(/['"]/g,"");A=o.substring(0,w.index);o=o.substring(w.index+w[0].length,o.length);if(o.indexOf(".")===0)o=o.substring(1,o.length);v=
a(A.split("."),v,q?k.context:null);q=false;if(!v&&i){n.error('blade/jig: No property "'+i+'" on '+v);return""}if(i.indexOf(":")!==-1){w=i.split(":");i=c(w[0]);v=(w=c(w[1]))?v.slice(i,w):v.slice(i)}else{k.strict&&!(i in v)&&n.error('blade/jig: no property "'+i+'"');v=v[i]}v=v}o=o?a(o.split("."),v,q?k.context:null):v;k.strict&&o===undefined&&n.error('blade/jig: undefined value for property "'+g+'"');return o}function h(g,i){i=i||{};var k=n.cache(g,i);if(k===undefined&&typeof document!=="undefined"){(k=
document.getElementById(g))&&n.parse([k],i);k=n.cache(g,i)}if(k===undefined)throw new Error("blade/jig: no template or node with ID: "+g);return k}function j(g,i){for(var k=[],l=0,o=false,v=0,q,w,A,K,M,J;(q=g.indexOf(i.startToken,l))!==-1;){q!==l&&k.push(g.substring(l,q));l=g.substring(q);if(w=i.endRegExp.exec(l)){l=q+w[0].length;A=g.substring(q+i.startToken.length,q+w[0].length-i.endToken.length).trim();A=D(A);if(u.test(A))throw new Error("blade/jig: end block tags should not be commented: "+A);
q=A.charAt(0);if(q==="]"&&v){o=A.substring(1).trim();if(o==="[")q=">";else{q=o.charAt(0);A=o}}if(q&&!i.propertyRegExp.test(q))A=A.substring(1).trim();else q="_default_";if(o=A.indexOf(i.rawHtmlToken)===0)A=A.substring(i.rawHtmlToken.length,A.length);if(q===H)o=true;A=A.split(i.argSeparator);K=A[A.length-1];M=K.charAt(K.length-1);J=null;if(q==="]"){if(M!=="["){k.templateEnd=l;k.endControl=true}else k.templateEnd=l-w[0].length;return k}else if(M==="["){v||(v=I++);A[A.length-1]=K.substring(0,K.length-
1);J=j(g.substring(l),i);l+=J.templateEnd}if(q==="+")i.templates[A[0]]=J;else if(q!=="/"){if(A.length>1)for(w=A.length-1;w>=0;w--)if(A[w].charAt(A[w].length-1)===","){A[w]+=A[w+1];A.splice(w+1,1)}k.push({action:i.commands[q].action,useRawHtml:o,args:A,controlId:v,children:J})}if(J&&J.endControl)v=0}else{k.push(l);return k}}l!==g.length-1&&k.push(g.substring(l,g.length));return k}function m(g,i){var k,l=g.id;k=i.templates||z;if(k[l])return k[l];i.onBeforeParse&&i.onBeforeParse(g);if(g.nodeName.toUpperCase()===
"SCRIPT"){k=g.text.trim();g.parentNode&&g.parentNode.removeChild(g)}else{L.appendChild(g);g.removeAttribute("id");(k=(g.getAttribute("class")||"").trim())&&g.setAttribute("class",k.replace(N,"$1$3"));k=L.innerHTML.replace(/%7B/g,"{").replace(/%7D/g,"}");L.removeChild(g)}g=n.compile(k,i);n.cache(l,g,i);return g}function p(g,i,k){var l="",o,v,q,w,A;if(typeof g==="string")l=g;else if(d(g))for(o=0;o<g.length;o++){q=g[o].controlId;if(!q||q!==v||!A){w=p(g[o],i,k);l+=w;if(q){v=q;A=w}}}else if(l=g.action(g.args,
i,k,g.children,p)){if(!g.useRawHtml&&!g.children)l=n.htmlEscape(l.toString())}else l="";if(k.attachData)if(s.test(l)){g="id"+G++;l=l.replace(s,'$& data-blade-jig="'+g+'" ');F[g]=i}return l}function x(g){g.fn.jig=function(i,k){k=k||{};var l=this.selector;if(l.charAt(0)!=="#")throw new Error('blade/jig: only ID selectors, like "#something" are allowed with jig()');l=l.substring(1,l.length);(l=(k.templates||z)[l])||(l=m(this[0]));return g(n.render(l,i,k))}}var n,C,E=Object.prototype.toString,D=typeof decodeURIComponent===
"undefined"?function(){}:decodeURIComponent,H="#",r=/[_\[\^\w]/,t="_",s=/<\s*\w+/,y=/^\d+$/,u=/\/(\/)?\s*\]/,z={},B={openCurly:function(){return"{"},closeCurly:function(){return"}"},eq:function(g,i){return g===i},gt:function(g,i){return g>i},gte:function(g,i){return g>=i},lt:function(g,i){return g<i},lte:function(g,i){return g<=i},or:function(g,i){return g||i},and:function(g,i){return g&&i},is:function(g){return!!g},eachProp:function(g){var i,k=[];for(i in g)g.hasOwnProperty(i)&&k.push({prop:i,value:g[i]});
return k.sort(function(l,o){return l.prop>o.prop?1:-1})}},G=1,I=1,F={},L=typeof document!=="undefined"&&document.createElement?document.createElement("div"):null,N=/(\s*)(template)(\s*)/;C={_default_:{doc:"Property reference",action:function(g,i,k,l,o){var v=g[0]?e(g[0],i,k):i,q=g[1]?e(g[1],i,k):undefined,w="";if(g[1]){q=v===q;v=i}else q=v;if(q===false||q===null||q===undefined||d(q)&&!q.length)return"";else if(l)if(d(v))for(g=0;g<v.length;g++)w+=o(l,v[g],k);else{if(typeof v==="boolean")v=i;w=o(l,
v,k)}else w=v;return w}},"!":{doc:"Not",action:function(g,i,k,l,o){var v=e(g[0],i,k),q=g[1]?e(g[1],i,k):undefined;q=g[1]?v===q:v;if(l&&!q)return o(l,i,k);return""}},"#":{doc:"Template reference",action:function(g,i,k,l,o){l=h(g[0],k);i=e(g.length>1?g[1]:t,i,k);return o(l,i,k)}},".":{doc:"Variable declaration",action:function(g,i,k){k.context[g[0]]=e(g[1],i,k);return""}},">":{doc:"Else",action:function(g,i,k,l,o){if(l)return o(l,i,k);return""}}};n=function(g,i,k){if(typeof g==="string")if(g.charAt(0)===
"#"){g=g.substring(1,g.length);g=h(g,k)}else g=n.compile(g,k);return n.render(g,i,k)};n.htmlEscape=function(g){return g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};n.compile=function(g,i){i=i||{};b.mixin(i,{startToken:"{",endToken:"}",rawHtmlToken:"^",propertyRegExp:r,commands:C,argSeparator:" ",templates:z});i.endRegExp=/[^\r\n]*?}/;I=1;return j(g,i)};n.parse=function(g,i){if(g&&!g.length){i=g;g=null}i=i||{};g=g||document.querySelectorAll('.template, script[type="text/template"]');
var k,l;for(l=g.length-1;l>-1&&(k=g[l]);l--)m(k,i)};n.render=function(g,i,k){var l,o="";k=k||{};b.mixin(k,{templates:z,attachData:false,strict:n.strict});if(k.fn)b.mixin(k.fn,B);else k.fn=B;k.context=k.context||b.create(i);if(d(i)){for(l=0;l<i.length;l++)o+=p(g,i[l],k);return o}return p(g,i,k)};n.strict=false;n.error=function(g){throw g;};n.addFn=function(g){b.mixin(B,g,true)};n.data=function(g,i){if(typeof g!=="string"){g.nodeType||(g=g[0]);g=g.getAttribute("data-blade-jig")}return i!==undefined?
(F[g]=i):F[g]};n.removeData=function(g){delete F[g]};n.getObject=e;n.cache=function(g,i,k){if(typeof i==="string")i=n.compile(i,k);if(!d(i)){k=i;i=undefined}k=k&&k.templates||z;if(i!==undefined)k[g]=i;return k[g]||z[g]};typeof jQuery!=="undefined"&&x(jQuery);return n});
define("friendly",["require","exports","module"],function(){var f={timestamp:function(b){return f.date(new Date(b*1E3))},date:function(b){var d=((new Date).getTime()-b.getTime())/1E3,a=Math.floor(d/86400),c={friendly:b.toLocaleDateString(),additional:b.toLocaleTimeString(),utc:b.toUTCString(),locale:b.toLocaleString()};if(a<0){c.friendly="in the future";return c}else if(isNaN(a)){c.friendly=c.additional="unknown";return c}if(a===0){if(d<60){c.friendly="just now";return c}if(d<150){c.friendly="a minute ago";
return c}if(d<3600){c.friendly=Math.floor(d/60)+" minutes ago";return c}if(d<7200){c.friendly="1 hour ago";return c}if(d<86400){c.friendly=Math.floor(d/3600)+" hours ago";return c}}if(a===1){c.friendly="yesterday";return c}if(a<7){c.friendly=a+" days ago";return c}if(a<8){c.friendly="last week";return c}if(a<31){c.friendly=Math.ceil(a/7)+" weeks ago";return c}if(a<62){c.friendly="a month ago";return c}if(a<365){c.friendly=Math.ceil(a/31)+" months ago";return c}if(a>=365&&a<730){c.additional=b.toLocaleDateString();
c.friendly="a year ago";return c}if(a>=365){c.additional=b.toLocaleDateString();c.friendly=Math.ceil(a/365)+" years ago";return c}return c},name:function(b){b=b.split(" ")[0];if(b.indexOf("@")!==-1)b=b.split("@")[0];b=b.replace(" ","");b=b.replace("'","");return b=b.replace('"',"")}};return f});
define("isoDate",[],function(){var f=/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+\-](\d{2}):(\d{2}))|Z)?)?$/,b=function(d,a){var c=f.exec(d);d=null;var e,h;if(c){c.shift();c[1]&&c[1]--;if(c[6])c[6]*=1E3;if(a){a=new Date(a);["FullYear","Month","Date","Hours","Minutes","Seconds","Milliseconds"].map(function(j){return a["get"+j]()}).forEach(function(j,m){c[m]=c[m]||j})}d=new Date(c[0]||1970,c[1]||0,c[2]||1,c[3]||0,c[4]||0,c[5]||0,c[6]||0);if(c[0]<100)d.setFullYear(c[0]||
1970);e=0;h=c[7]&&c[7].charAt(0);if(h!=="Z"){e=(c[8]||0)*60+(Number(c[9])||0);if(h!=="-")e*=-1}if(h)e-=d.getTimezoneOffset();e&&d.setTime(d.getTime()+e*6E4)}return d};b.toIsoString=function(d,a){var c=function(m){return m<10?"0"+m:m},e,h,j;a=a||{};e=[];h=a.zulu?"getUTC":"get";j="";if(a.selector!=="time"){j=d[h+"FullYear"]();j=["0000".substr((j+"").length)+j,c(d[h+"Month"]()+1),c(d[h+"Date"]())].join("-")}e.push(j);if(a.selector!=="date"){j=[c(d[h+"Hours"]()),c(d[h+"Minutes"]()),c(d[h+"Seconds"]())].join(":");
h=d[h+"Milliseconds"]();if(a.milliseconds)j+="."+(h<100?"0":"")+c(h);if(a.zulu)j+="Z";else if(a.selector!=="time"){d=d.getTimezoneOffset();a=Math.abs(d);j+=(d>0?"-":"+")+c(Math.floor(a/60))+":"+c(a%60)}e.push(j)}return e.join("T")};return b});var EXPORTED_SYMBOLS=["hex_md5"],hexcase=0,b64pad="";function hex_md5(f){return rstr2hex(rstr_md5(str2rstr_utf8(f)))}function b64_md5(f){return rstr2b64(rstr_md5(str2rstr_utf8(f)))}function any_md5(f,b){return rstr2any(rstr_md5(str2rstr_utf8(f)),b)}
function hex_hmac_md5(f,b){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(f),str2rstr_utf8(b)))}function b64_hmac_md5(f,b){return rstr2b64(rstr_hmac_md5(str2rstr_utf8(f),str2rstr_utf8(b)))}function any_hmac_md5(f,b,d){return rstr2any(rstr_hmac_md5(str2rstr_utf8(f),str2rstr_utf8(b)),d)}function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72"}function rstr_md5(f){return binl2rstr(binl_md5(rstr2binl(f),f.length*8))}
function rstr_hmac_md5(f,b){var d=rstr2binl(f);if(d.length>16)d=binl_md5(d,f.length*8);var a=Array(16);f=Array(16);for(var c=0;c<16;c++){a[c]=d[c]^909522486;f[c]=d[c]^1549556828}b=binl_md5(a.concat(rstr2binl(b)),512+b.length*8);return binl2rstr(binl_md5(f.concat(b),640))}function rstr2hex(f){for(var b=hexcase?"0123456789ABCDEF":"0123456789abcdef",d="",a,c=0;c<f.length;c++){a=f.charCodeAt(c);d+=b.charAt(a>>>4&15)+b.charAt(a&15)}return d}
function rstr2b64(f){for(var b="",d=f.length,a=0;a<d;a+=3)for(var c=f.charCodeAt(a)<<16|(a+1<d?f.charCodeAt(a+1)<<8:0)|(a+2<d?f.charCodeAt(a+2):0),e=0;e<4;e++)b+=a*8+e*6>f.length*8?b64pad:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(c>>>6*(3-e)&63);return b}
function rstr2any(f,b){var d=b.length,a,c,e,h,j,m=Array(Math.ceil(f.length/2));for(a=0;a<m.length;a++)m[a]=f.charCodeAt(a*2)<<8|f.charCodeAt(a*2+1);var p=Math.ceil(f.length*8/(Math.log(b.length)/Math.log(2)));f=Array(p);for(c=0;c<p;c++){j=Array();for(a=h=0;a<m.length;a++){h=(h<<16)+m[a];e=Math.floor(h/d);h-=e*d;if(j.length>0||e>0)j[j.length]=e}f[c]=h;m=j}d="";for(a=f.length-1;a>=0;a--)d+=b.charAt(f[a]);return d}
function str2rstr_utf8(f){for(var b="",d=-1,a,c;++d<f.length;){a=f.charCodeAt(d);c=d+1<f.length?f.charCodeAt(d+1):0;if(55296<=a&&a<=56319&&56320<=c&&c<=57343){a=65536+((a&1023)<<10)+(c&1023);d++}if(a<=127)b+=String.fromCharCode(a);else if(a<=2047)b+=String.fromCharCode(192|a>>>6&31,128|a&63);else if(a<=65535)b+=String.fromCharCode(224|a>>>12&15,128|a>>>6&63,128|a&63);else if(a<=2097151)b+=String.fromCharCode(240|a>>>18&7,128|a>>>12&63,128|a>>>6&63,128|a&63)}return b}
function str2rstr_utf16le(f){for(var b="",d=0;d<f.length;d++)b+=String.fromCharCode(f.charCodeAt(d)&255,f.charCodeAt(d)>>>8&255);return b}function str2rstr_utf16be(f){for(var b="",d=0;d<f.length;d++)b+=String.fromCharCode(f.charCodeAt(d)>>>8&255,f.charCodeAt(d)&255);return b}function rstr2binl(f){for(var b=Array(f.length>>2),d=0;d<b.length;d++)b[d]=0;for(d=0;d<f.length*8;d+=8)b[d>>5]|=(f.charCodeAt(d/8)&255)<<d%32;return b}
function binl2rstr(f){for(var b="",d=0;d<f.length*32;d+=8)b+=String.fromCharCode(f[d>>5]>>>d%32&255);return b}
function binl_md5(f,b){f[b>>5]|=128<<b%32;f[(b+64>>>9<<4)+14]=b;b=1732584193;for(var d=-271733879,a=-1732584194,c=271733878,e=0;e<f.length;e+=16){var h=b,j=d,m=a,p=c;b=md5_ff(b,d,a,c,f[e+0],7,-680876936);c=md5_ff(c,b,d,a,f[e+1],12,-389564586);a=md5_ff(a,c,b,d,f[e+2],17,606105819);d=md5_ff(d,a,c,b,f[e+3],22,-1044525330);b=md5_ff(b,d,a,c,f[e+4],7,-176418897);c=md5_ff(c,b,d,a,f[e+5],12,1200080426);a=md5_ff(a,c,b,d,f[e+6],17,-1473231341);d=md5_ff(d,a,c,b,f[e+7],22,-45705983);b=md5_ff(b,d,a,c,f[e+8],7,
1770035416);c=md5_ff(c,b,d,a,f[e+9],12,-1958414417);a=md5_ff(a,c,b,d,f[e+10],17,-42063);d=md5_ff(d,a,c,b,f[e+11],22,-1990404162);b=md5_ff(b,d,a,c,f[e+12],7,1804603682);c=md5_ff(c,b,d,a,f[e+13],12,-40341101);a=md5_ff(a,c,b,d,f[e+14],17,-1502002290);d=md5_ff(d,a,c,b,f[e+15],22,1236535329);b=md5_gg(b,d,a,c,f[e+1],5,-165796510);c=md5_gg(c,b,d,a,f[e+6],9,-1069501632);a=md5_gg(a,c,b,d,f[e+11],14,643717713);d=md5_gg(d,a,c,b,f[e+0],20,-373897302);b=md5_gg(b,d,a,c,f[e+5],5,-701558691);c=md5_gg(c,b,d,a,f[e+
10],9,38016083);a=md5_gg(a,c,b,d,f[e+15],14,-660478335);d=md5_gg(d,a,c,b,f[e+4],20,-405537848);b=md5_gg(b,d,a,c,f[e+9],5,568446438);c=md5_gg(c,b,d,a,f[e+14],9,-1019803690);a=md5_gg(a,c,b,d,f[e+3],14,-187363961);d=md5_gg(d,a,c,b,f[e+8],20,1163531501);b=md5_gg(b,d,a,c,f[e+13],5,-1444681467);c=md5_gg(c,b,d,a,f[e+2],9,-51403784);a=md5_gg(a,c,b,d,f[e+7],14,1735328473);d=md5_gg(d,a,c,b,f[e+12],20,-1926607734);b=md5_hh(b,d,a,c,f[e+5],4,-378558);c=md5_hh(c,b,d,a,f[e+8],11,-2022574463);a=md5_hh(a,c,b,d,f[e+
11],16,1839030562);d=md5_hh(d,a,c,b,f[e+14],23,-35309556);b=md5_hh(b,d,a,c,f[e+1],4,-1530992060);c=md5_hh(c,b,d,a,f[e+4],11,1272893353);a=md5_hh(a,c,b,d,f[e+7],16,-155497632);d=md5_hh(d,a,c,b,f[e+10],23,-1094730640);b=md5_hh(b,d,a,c,f[e+13],4,681279174);c=md5_hh(c,b,d,a,f[e+0],11,-358537222);a=md5_hh(a,c,b,d,f[e+3],16,-722521979);d=md5_hh(d,a,c,b,f[e+6],23,76029189);b=md5_hh(b,d,a,c,f[e+9],4,-640364487);c=md5_hh(c,b,d,a,f[e+12],11,-421815835);a=md5_hh(a,c,b,d,f[e+15],16,530742520);d=md5_hh(d,a,c,
b,f[e+2],23,-995338651);b=md5_ii(b,d,a,c,f[e+0],6,-198630844);c=md5_ii(c,b,d,a,f[e+7],10,1126891415);a=md5_ii(a,c,b,d,f[e+14],15,-1416354905);d=md5_ii(d,a,c,b,f[e+5],21,-57434055);b=md5_ii(b,d,a,c,f[e+12],6,1700485571);c=md5_ii(c,b,d,a,f[e+3],10,-1894986606);a=md5_ii(a,c,b,d,f[e+10],15,-1051523);d=md5_ii(d,a,c,b,f[e+1],21,-2054922799);b=md5_ii(b,d,a,c,f[e+8],6,1873313359);c=md5_ii(c,b,d,a,f[e+15],10,-30611744);a=md5_ii(a,c,b,d,f[e+6],15,-1560198380);d=md5_ii(d,a,c,b,f[e+13],21,1309151649);b=md5_ii(b,
d,a,c,f[e+4],6,-145523070);c=md5_ii(c,b,d,a,f[e+11],10,-1120210379);a=md5_ii(a,c,b,d,f[e+2],15,718787259);d=md5_ii(d,a,c,b,f[e+9],21,-343485551);b=safe_add(b,h);d=safe_add(d,j);a=safe_add(a,m);c=safe_add(c,p)}return Array(b,d,a,c)}function md5_cmn(f,b,d,a,c,e){return safe_add(bit_rol(safe_add(safe_add(b,f),safe_add(a,e)),c),d)}function md5_ff(f,b,d,a,c,e,h){return md5_cmn(b&d|~b&a,f,b,c,e,h)}function md5_gg(f,b,d,a,c,e,h){return md5_cmn(b&a|d&~a,f,b,c,e,h)}
function md5_hh(f,b,d,a,c,e,h){return md5_cmn(b^d^a,f,b,c,e,h)}function md5_ii(f,b,d,a,c,e,h){return md5_cmn(d^(b|~a),f,b,c,e,h)}function safe_add(f,b){var d=(f&65535)+(b&65535);return(f>>16)+(b>>16)+(d>>16)<<16|d&65535}function bit_rol(f,b){return f<<b|f>>>32-b}define("md5",function(){});
define("rdapi",["require","jquery","blade/object","blade/jig","friendly","isoDate","md5"],function(f,b,d,a,c,e){function h(r){if(typeof r==="string")r={template:r};else if(r.templateId)r.template=a.cache(r.templateId);if(!("attachData"in r))r.attachData=x.attachTemplateData;if(r.emptyTemplateId)r.emptyTemplate=a.cache(r.emptyTemplateId);return r}function j(){var r=C.exec(document.cookie);return r&&r[1]?r[1]:null}function m(r,t){t.url=H.baseUrl+H.apiPath+r;d.mixin(t,{limit:30,message_limit:3,dataType:"json",
error:function(u,z,B){throw B;}});var s=t.success,y=j();t.success=function(u){u&&u.contacts&&d.mixin(E,u.contacts,true);return s?s.apply(null,arguments):u};if(y)t.beforeSend=function(u){u.setRequestHeader(n,y)};b.ajax(t)}function p(r,t){var s=t.forId?document.getElementById(t.forId):null;if(s)s.innerHTML=r;t.onTemplateDone&&t.onTemplateDone(r);b(document).trigger("rdapi-done",s)}var x,n="X-CSRF",C=/csrf=([^\; ]+)/,E={},D={contact:function(r){return r.iid&&r.domain?E[r.iid]||{}:r},contactPhotoUrl:function(r){var t=
"i/face2.png",s,y;r=D.contact(r);if((s=r.photos)&&s.length){t=s[0].value;s.forEach(function(u){if(u.primary)t=u.value})}else if(r.emails&&r.emails.length){y=r.emails[0].value;r.emails.forEach(function(u){if(u.primary)y=u.value});t="http://www.gravatar.com/avatar/"+hex_md5(y)+"?s=24 &d=identicon"}return t},allMessages:function(r){return[r.topic].concat(r.messages||[])},friendlyDate:function(r){return c.date(e(r)).friendly},htmlBody:function(r){return a.htmlEscape(r).replace(/\n/g,"<br>")}},H={baseUrl:"/",
apiPath:"api/",saveTemplateData:true};a.addFn(D);x=function(r,t){t=h(t);d.mixin(t,{success:function(s){var y=t.template,u=t.emptyTemplate,z="";if(t.forId&&y){if(t.prop)s=a.getObject(t.prop,s,t);if(f.isArray(s))if(s.length)s.forEach(function(B){z+=a(y,B,t)});else z+=a(u,s,t);else z+=a(!s?u:y,s,t);p(z,t)}},error:function(s,y,u){if(t.emptyTemplate){s=a(t.emptyTemplate,u,t);p(s,t)}else throw u;}});m(r,t)};x.contactPhotoUrl=D.contactPhotoUrl;x.attachTemplateData=false;f.ready(function(){var r=[];a.parse({onBeforeParse:function(t){var s=
t.id,y=t.getAttribute("data-rdapi"),u=t.getAttribute("data-rdfor"),z=t.getAttribute("data-rdprop");y&&r.push({templateId:s,api:y,forId:u,prop:z});["data-rdapi","data-rdprop","data-rdfor"].forEach(function(B){t.removeAttribute(B)})}});r.forEach(function(t){x(t.api,t)})});return x});
define("oauth",[],function(){var f,b,d=0;window.addEventListener("message",function(a){if(a=a.data){a=a==="oauth_success"?true:false;b=null;if(f){f(a);f=null}}},false);return function(a,c){if(c)f=c;c=location.protocol+"//"+location.host+"/auth.html";var e=(new Date).getTime();if(b&&b.closed)b=null;if(e>d+4E3){d=e;a=c+"?domain="+a;try{b=window.open(a,"ffshareOAuth","dialog=yes, modal=yes, width=900, height=500, scrollbars=yes");b.focus()}catch(h){window.location=a+"&end_point_success="+encodeURI(window.location)}}else b&&
b.focus()}});define("dispatch",["jquery"],function(){var f=location.protocol+"//"+location.host;return{sub:function(b,d,a,c){a=a||window;c=c||f;var e=function(h){if(h.origin===c||h.origin==="chrome://browser"){h=JSON.parse(h.data);var j=h.topic;j&&j===b&&d(h.data)}};a.addEventListener("message",e,false);return e},unsub:function(b,d){d=d||window;d.removeEventListener("message",b,false)},pub:function(b,d,a){a=a||window;a.postMessage(JSON.stringify({topic:b,data:d}),f)}}});
define("storage",[],function(){function f(){return b}var b=localStorage,d="localStorage";try{b.tempVar="temp";delete b.tempVar}catch(a){b={};d="memory"}f.type=d;return f});
define("accounts",["storage","dispatch","rdapi"],function(f,b,d){function a(j,m){return h.accounts(j,m)}function c(){location.reload()}var e=f(),h;h={localStorage:{accounts:function(j,m){var p=e.accountCache,x=e.lastAccountCheck||0,n=(new Date).getTime(),C=false;if(!p||n-x>3E3)C=true;p=p?JSON.parse(p):[];j&&j(p);C&&h.fetch(null,m)},fetch:function(j,m){d("account/get",{success:function(p){if(p.error)p=[];e.lastAccountCheck=(new Date).getTime();j&&j(p);var x=e.accountCache,n;x=x?JSON.parse(x):[];if(n=
p.length===x.length)n=!p.some(function(C,E){return C.identifier!==x[E].identifier});if(!n){e.accountCache=JSON.stringify(p);h.changed()}},error:m||function(){}})},changed:function(){e.accountChanged=(new Date).getTime()},onChange:function(j){var m=e.accountChanged;window.addEventListener("storage",function(){e.accountChanged!==m&&j()},false)}},memory:{accounts:function(j,m){h.fetch(j,m)},fetch:function(j,m){d("account/get",{success:function(p){if(p.error)p=[];j&&j(p)},error:m||function(){}})},changed:function(){e.accountChanged=
(new Date).getTime();opener&&b.pub("accountsChanged",null,opener);b.pub("accountsChanged")},onChange:function(j){b.sub("accountsChanged",j)}}}[f.type];a.fetch=function(j,m){h.fetch(j,m)};a.clear=function(){delete e.accountCache};a.changed=function(){return h.changed()};a.onChange=function(j){return h.onChange(j||c)};return a});
define("dotCompare",[],function(){function f(b,d){b=b||"0";d=d||"0";b=b.split(".");d=d.split(".");var a,c,e,h=b.length>d.length?b.length:d.length;for(a=0;a<h;a++){c=parseInt(b[a]||"0",10);e=parseInt(d[a]||"0",10);if(c>e)return 1;else if(c<e)return-1}return 0}return f});define("blade/array",[],function(){var f=Object.prototype.toString,b=Array.prototype.slice;return{is:function(d){return f.call(d)==="[object Array]"},to:function(){return[].concat(b.call(arguments,0))}}});
define("blade/url",["./array"],function(f){var b=Object.prototype.toString;return{objectToQuery:function(d){var a=encodeURIComponent,c=[],e={},h,j,m,p;for(h in d)if(d.hasOwnProperty(h)){j=d[h];if(j!==e[h]){m=a(h)+"=";if(f.is(j))for(p=0;p<j.length;p++)c.push(m+a(j[p]));else c.push(m+a(j))}}return c.join("&")},queryToObject:function(d){var a={};d=d.split("&");var c=decodeURIComponent,e,h,j;d.forEach(function(m){if(m.length){e=m.split("=");h=c(e.shift());j=c(e.join("="));if(typeof a[h]==="string")a[h]=
[a[h]];if(b.call(a[h])==="[object Array]")a[h].push(j);else a[h]=j}});return a}}});
define("TextCounter",["jquery","blade/object","blade/fn"],function(f,b,d){return b(null,null,{init:function(a,c,e){this.dom=f(a);this.domPlaceholderText=this.dom[0].getAttribute("placeholder")||"";this.countDom=f(c);this.limit=e;this.dom.bind("keyup",d.bind(this,"checkCount"));this.checkCount()},checkCount:function(){var a=this.dom[0].value;if(a.trim()===this.domPlaceholderText)a="";a=this.limit-a.length;a<0?this.countDom.addClass("TextCountOver"):this.countDom.removeClass("TextCountOver");this.countDom.text(a===
this.limit?"":a)},updateLimit:function(a){this.limit=a;this.checkCount()},isOver:function(){return this.dom[0].value.length>this.limit}})});
define("services",["rdapi","blade/object","TextCounter"],function(f,b){function d(e,h){if(e){this.name=e;this.type=e.replace(/\s/g,"").toLowerCase();this.tabName=this.type+"Tab";this.icon="i/"+this.type+"Icon.png";this.shorten=false;this.autoCompleteWidget=null;this.features={counter:false,direct:false,subject:false};b.mixin(this,h)}}function a(){d.constructor.apply(this,arguments);this.features.direct=true;this.features.subject=true}var c;d.constructor=d;d.prototype={clearCache:function(e){delete e[this.type+
"Contacts"]},getContacts:function(e){if(e[this.type+"Contacts"])return JSON.parse(e[this.type+"Contacts"]);return null},setContacts:function(e,h){e[this.type+"Contacts"]=JSON.stringify(h)},getFormattedContacts:function(e){var h={};e.forEach(function(j){j.accounts&&j.accounts.length&&j.accounts.forEach(function(m){h[j.displayName]={email:"",userid:m.userid,username:m.username}})});return h}};a.prototype=new d;a.constructor=a;a.prototype.validate=function(e){if(!e.to||!e.to.trim())return false;return true};
a.prototype.getFormattedContacts=function(e){var h={};e.forEach(function(j){j.emails&&j.emails.length&&j.emails.forEach(function(m){h[j.displayName?j.displayName:m.value]={email:m.value,userid:null,username:null}})});return h};f={domains:{"twitter.com":new d("Twitter",{features:{direct:true,subject:false,counter:true},shareTypes:[{type:"public",name:"public"},{type:"direct",name:"direct message",showTo:true,toLabel:"type in name of recipient"}],textLimit:140,shorten:true,serviceUrl:"http://twitter.com",
revokeUrl:"http://twitter.com/settings/connections",signOutUrl:"http://twitter.com/logout",accountLink:function(e){return"http://twitter.com/"+e.username}}),"facebook.com":new d("Facebook",{features:{direct:true,subject:false,counter:true},shareTypes:[{type:"wall",name:"my wall"},{type:"groupWall",name:"group wall",showTo:true,toLabel:"type in the name of the group"}],textLimit:420,serviceUrl:"http://facebook.com",revokeUrl:"http://www.facebook.com/editapps.php?v=allowed",signOutUrl:"http://facebook.com",
accountLink:function(e){return"http://www.facebook.com/profile.php?id="+e.userid}}),"google.com":new a("Gmail",{shareTypes:[{type:"direct",name:"direct",showTo:true}],serviceUrl:"https://mail.google.com",revokeUrl:"https://www.google.com/accounts/IssuedAuthSubTokens",signOutUrl:"http://google.com/preferences",accountLink:function(e){return"http://google.com/profiles/"+e.username}}),"googleapps.com":new a("Google Apps",{shareTypes:[{type:"direct",name:"direct",showTo:true}],icon:"i/gmailIcon.png",
serviceUrl:"https://mail.google.com",revokeUrl:"https://www.google.com/accounts/IssuedAuthSubTokens",signOutUrl:"http://google.com/preferences",accountLink:function(e){return"http://google.com/profiles/"+e.username}}),"yahoo.com":new a("Yahoo",{shareTypes:[{type:"direct",name:"direct",showTo:true}],name:"Yahoo!",serviceUrl:"http://mail.yahoo.com",revokeUrl:"https://api.login.yahoo.com/WSLogin/V1/unlink",signOutUrl:"https://login.yahoo.com/config/login?logout=1",accountLink:function(e){return"http://profiles.yahoo.com/"+
e.username}}),"linkedin.com":new d("LinkedIn",{isNew:true,features:{direct:true,subject:true,counter:false},shareTypes:[{type:"public",name:"public"},{type:"myConnections",name:"my connections",specialTo:"connections-only"},{type:"contact",name:"my contacts",showTo:true,toLabel:"type in the name of the contact"}],serviceUrl:"http://linkedin.com",revokeUrl:"http://linkedin.com/settings/connections",signOutUrl:"http://linkedin.com/logout",accountLink:function(e){return"http://linkedin.com/"+e.username}})},
domainList:[],svcBaseProto:d.prototype};for(c in f.domains)f.domains.hasOwnProperty(c)&&f.domainList.push(c);return f});
(function(f){function b(c){var e;if(c&&c.constructor==Array&&c.length==3)return c;if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c))return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])];if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c))return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55];if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c))return[parseInt(e[1],16),parseInt(e[2],
16),parseInt(e[3],16)];if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c))return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)];return a[f.trim(c).toLowerCase()]}function d(c,e){var h;do{h=f.curCSS(c,e);if(h!=""&&h!="transparent"||f.nodeName(c,"body"))break;e="backgroundColor"}while(c=c.parentNode);return b(h)}f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(c,e){f.fx.step[e]=function(h){if(h.state==
0){h.start=d(h.elem,e);h.end=b(h.end)}h.elem.style[e]="rgb("+[Math.max(Math.min(parseInt(h.pos*(h.end[0]-h.start[0])+h.start[0]),255),0),Math.max(Math.min(parseInt(h.pos*(h.end[1]-h.start[1])+h.start[1]),255),0),Math.max(Math.min(parseInt(h.pos*(h.end[2]-h.start[2])+h.start[2]),255),0)].join(",")+")"}});var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,
100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,
128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);define("jquery.colorFade",function(){});
(function(f){var b=document.documentElement.style,d="textOverflow"in b||"OTextOverflow"in b,a=function(c,e){var h=0,j=[],m=function(p){var x=0,n;if(!(h>e))for(x=0;x<p.length;x+=1)if(p[x].nodeType===1){n=p[x].cloneNode(false);j[j.length-1].appendChild(n);j.push(n);m(p[x].childNodes);j.pop()}else if(p[x].nodeType===3){if(h+p[x].length<e)j[j.length-1].appendChild(p[x].cloneNode(false));else{n=p[x].cloneNode(false);n.textContent=f.trim(n.textContent.substring(0,e-h));j[j.length-1].appendChild(n)}h+=p[x].length}else j.appendChild(p[x].cloneNode(false))};
j.push(c.cloneNode(false));m(c.childNodes);return f(j.pop().childNodes)};f.extend(f.fn,{textOverflow:function(c,e){var h=c||"&#x2026;";return d?this:this.each(function(){var j=f(this),m=j.clone(),p=j.clone(),x=j.text(),n=j.width(),C=0,E=0,D=x.length,H=function(){if(n!==j.width()){j.replaceWith(p);j=p;p=j.clone();j.textOverflow(c,false);n=j.width()}};j.after(m.hide().css({position:"absolute",width:"auto",overflow:"visible","max-width":"inherit"}));if(m.width()>n){for(;C<D;){E=Math.floor(C+(D-C)/2);
m.empty().append(a(p.get(0),E)).append(h);if(m.width()<n)C=E+1;else D=E}C<x.length&&j.empty().append(a(p.get(0),C-1)).append(h)}m.remove();e&&setInterval(H,200)})}})})(jQuery);define("jquery.textOverflow",function(){});
define("index",["require","jquery","blade/fn","rdapi","oauth","blade/jig","dispatch","storage","accounts","dotCompare","blade/url","services","jquery.colorFade","jquery.textOverflow"],function(f,b,d,a,c,e,h,j,m,p,x,n){function C(s,y){b("div.status").addClass("hidden");b("#"+s).removeClass("hidden");y&&b("#"+s+" .message").text(y)}function E(s,y,u){s.status===503?C("statusServerBusyClose"):C("statusServerError",u)}var D=j(),H=p(D.extensionVersion,"0.7.3")>-1,r=x.queryToObject(location.href.split("#")[1]||
"")||{},t=r.show==="new";e.addFn({domainType:function(s){return(s=n.domains[s.accounts[0].domain])?s.type:""},domainName:function(s){return(s=n.domains[s.accounts[0].domain])?s.name:""},accountName:function(s,y){return y.username&&y.username!==s?s+", "+y.username:s}});m.onChange();m(function(s){b(function(){var y="";s.forEach(function(u){var z=n.domainList.indexOf(u.accounts[0].domain);z!==-1&&n.domainList.splice(z,1);y+=e("#accountTemplate",u)});if(y){b("#existingHeader").removeClass("hidden");b("#existing").append(y).removeClass("hidden")}y=
"";n.domainList.forEach(function(u){n.domains[u].domain=u;y+=e("#addTemplate",n.domains[u])});if(y){b("#availableHeader").removeClass("hidden");b("#available").append(y).removeClass("hidden")}t&&b(function(){b("li.newItem").animate({backgroundColor:"#ffff99"},200).delay(1E3).animate({backgroundColor:"#fafafa"},3E3)})})},E);b(function(){if(t){delete r.show;location.replace(location.href.split("#")[0]+"#"+x.objectToQuery(r))}var s=b("#manage"),y=b("#settings"),u;b(window).bind("load resize",function(){var z=
b(window).height();b("#wrapper").css({"min-height":z})});b("body").delegate(".close","click",function(){window.close()}).delegate(".auth","click",function(z){z=z.target.getAttribute("data-domain");var B=n.domains[z].type;c(z,function(G){if(G){D.lastSelection=B;m.fetch(null,E)}else C("statusOAuthFailed")})}).delegate(".remove","click",function(z){var B=z.target,G=B.getAttribute("data-domain"),I=B.getAttribute("data-username");B=B.getAttribute("data-userid");var F=n.domains[G];a("account/signout",{data:{domain:G,
userid:B,username:I},success:function(){m.fetch(null,E)},error:function(L,N,g){C("statusError",g)}});F.clearCache(D);F.type===D.lastSelection&&delete D.lastSelection;z.preventDefault()}).delegate('#settings [type="checkbox"]',"click",function(z){var B=z.target;z=B.id;B=B.checked;D["prefs."+z]=B;opener&&!opener.closed&&h.pub("prefChanged",{name:z,value:B},opener)});u=(u=D["prefs.use_accel_key"])?JSON.parse(u):false;b("#use_accel_key")[0].checked=u||false;u=(u=D["prefs.bookmarking"])?JSON.parse(u):
false;b("#bookmarking")[0].checked=u||false;b(function(){b(".overflow").textOverflow(null,true)});H&&b("li.settings").removeClass("hidden");b("ul#tabs li").click(function(){b(this).addClass("selected");b(this).siblings().removeClass("selected")});b("ul#tabs li.manage").click(function(){if(s.is(":hidden")){s.fadeIn(200);s.siblings().fadeOut(0)}});b("ul#tabs li.settings").click(function(){if(y.is(":hidden")){y.fadeIn(200);y.siblings().fadeOut(0)}});window.onFeedLoad=function(z,B){var G,I,F;if(B&&B.feed&&
B.feed.entries)for(z=0;F=B.feed.entries[z];z++)if(F.categories&&F.categories.indexOf("Sharing")!==-1){I=F.link;G=F.title;break}if(I){b("#newsFooter .headline").removeClass("invisible");b("#rssLink").attr("href",I).text(G)}};u=document.createElement("script");u.charset="utf-8";u.async=true;u.src="http://www.google.com/uds/Gfeeds?v=1.0&callback=onFeedLoad&context=&output=json&q=http%3A%2F%2Fmozillalabs.com%2Fmessaging%2Ffeed%2F";b("head")[0].appendChild(u)})});