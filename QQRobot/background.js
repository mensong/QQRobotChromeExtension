/* background.js 每个浏览器进程调用一次 */

function objectToString(obj) 
{
	var propertList = "";
	for (prop in obj)
	{
		propertList += prop + ':' + obj[prop] + '\r\n';
	}
	
	return propertList;
}

var refreshIcon = function(b) {
	chrome.browserAction.setIcon({path: b? "qq_enable.png" : "qq_disable.png"});
};

(function(){
	console.log("backgroup.js loaded");
	
	chrome.browserAction.onClicked.addListener(function(tab){
		chrome.tabs.sendMessage( tab.id, {msg:"button"},
			function(response){
				/** 回调函数，用来处理请求返回的json对象:response **/
				//console.log("QQ robot status:" + response.status);
				//alert("QQ robot status:" + response.status);
				if (response.status != undefined)
				{
					//alert("QQ robot status:" + response.status);
					refreshIcon(response.status);
				}
			} 
			);
	});
	
})();