/* contentScript.js 每个有效的tab都会调用一次 */

var include = function(path){
	var a = document.createElement("script");
	a.type = "text/javascript";
	a.src = path;
	var head = document.getElementsByTagName("head")[0];
	if (head && a)
	{
		head.appendChild(a);
		return true;
	}
	return false;
};

function QQRobot()
{
	this._switch = true;
	this.changeSwitch = function(){
		this._switch = !this._switch;
	};

	/** 锁 **/
	this._lock = false;
	this.lock = function(){
		this._lock = true;
	}

	this.isLocked = function(){
		return this._lock;
	}

	this.unLock = function(){
		this._lock = false;
	}


	//获得当前弹出的消息框中的消息列表
	this.getCurrentMessageList = function(){
		var root = document.getElementById("panelBody-5");
		if (!root)
			return [];
		//是否是群消息
		var isGroup = 0;
		var groupType = document.getElementById('pannelMenuList-5');
		if (groupType)
		{
			isGroup = (groupType.getElementsByClassName("viewMembers").length > 0) ? 1 : 0;
		}
		
		var messages = [];
		var messageNodes = root.children;
		for (var i=0; i<messageNodes.length; ++i)
		{
			var msgInfo = {};
			var messageNode = messageNodes[i];
			var className = messageNode.className.replace(/(^\s*)|(\s*$)/g, "");
			if (className == "chat_time")
			{
				msgInfo['type'] = 2;
				var nodeSpans = messageNode.getElementsByTagName('span');
				if (nodeSpans)
					msgInfo['time'] = nodeSpans[0].textContent;
			}
			else if (className == "chat_content_group buddy")
			{
				msgInfo['type'] = 0;
				msgInfo['group'] = isGroup;
				msgInfo['fromUserId'] = messageNode.getAttribute('_sender_uin');
				msgInfo['fromUserName'] = messageNode.getElementsByClassName('chat_nick')[0].textContent;
				msgInfo['message'] = messageNode.getElementsByClassName('chat_content')[0].textContent;
			}
			else if (className == "chat_content_group self")
			{
				msgInfo['type'] = 1;
				msgInfo['group'] = isGroup;
				msgInfo['fromUserId'] = messageNode.getAttribute('_sender_uin');
				msgInfo['fromUserName'] = messageNode.getElementsByClassName('chat_nick')[0].textContent;
				msgInfo['message'] = messageNode.getElementsByClassName('chat_content')[0].textContent;
			}
			
			messages.push(msgInfo);
		}
			
		return messages;
	}

	//获得当前弹出的消息框的最新的一条消息
	this.getLastMessage = function(){
		var list = getCurrentMessageList();
		for (var i=list.length-1; i>=0; --i)
		{
			if (list[i]['type'] == 0)
			{
				return list[i];
			}
		}
		
		return null;
	}

	//获得当墙弹出的消息框标题
	this.getCurrentChatTargetInfo = function(){
		var info = {};
		info['title'] = document.getElementById('panelTitle-5').textContent;
		return info;
	}

	//获得回话列表
	this.getCurrentChatList = function(){
		var curChatList = document.getElementById('current_chat_list');
		var curCharItems = curChatList.getElementsByClassName('member_nick');
		return curCharItems;
	}

	//发送消息给当前弹出的消息框
	this.sendMessage = function(txt){
		document.getElementById('chat_textarea').value = txt;
		document.getElementById('send_chat_btn').click();
	}
	
	this.messageHandle = function(bot, msg){
		console.info(msg);
	};
}
	
//轮询消息
var needRefresh = false;//需要刷新页面
var lastMessageList = new Map();//历史纪录<"id", [lastList]>
var indexChat = 0;
var pollMessageHandle = 0;
var startPollMessage = function(bot) {
	pollMessageHandle = setInterval(function(){
		if (!bot._switch)
			return ;
		if (bot.isLocked())
			return ;
		
		var chatList = bot.getCurrentChatList();
		if (!chatList[indexChat])
			indexChat = 0;
		
		
		if (chatList[indexChat])
		{
			do 
			{
				//console.info(chatList[indexChat]);
				chatList[indexChat].click();
				
				//检查是否有新消息
				var curList = bot.getCurrentMessageList();
				var targetInfo = bot.getCurrentChatTargetInfo();
				var lastList = lastMessageList.get(targetInfo['title']);
				if (lastList == undefined)
				{
					lastList = [];
				}
				lastMessageList.put(targetInfo['title'], curList);	
				var newCount = curList.length - lastList.length;
				
				//为了保证在当前有消息时不刷新页面，
				//  检查第一个会话是否有新的消息，有的话暂时不刷新
				if (0 == indexChat && //第1个会话
				    0 == newCount &&  //没有新的消息
					needRefresh)      //需要刷新
				{
					window.open(document.URL, "_self");
					return ;
				}
				
				if (0 == newCount)
					break;//没有新消息
				
				for (var i=lastList.length; i<curList.length; ++i)
				{
					var msg = curList[i];
					if (msg['type'] == 0)
					{
						bot.messageHandle(bot, msg);
					}
				}
			} while(false);
			
			++indexChat;
		}
		else
		{
			if (needRefresh)//刷新
				window.open(document.URL, "_self");
		}
	}, 500);
};

//定时刷新页面，防止登录信息失效
var refreshMinutes = 5;//几分钟刷新一次
var refreshIndex = 0;
var keepAliveHandle = 0;
var startKeepAlive = function(bot) {
	keepAliveHandle = setInterval(function(){
		if (refreshIndex < refreshMinutes-1)
		{
			++refreshIndex;
			return ;
		}
		else
			refreshIndex = 0;
		
		if (!bot._switch)
			return ;
		
		needRefresh = true;
		//window.open(document.URL, "_self");
	}, 60000);
};

var qqBot = new QQRobot();
function main()
{
	console.log("contentscript injected!");
	startPollMessage(qqBot);
	startKeepAlive(qqBot);
	qqBot.messageHandle = registerMessageHandle();

	chrome.runtime.onMessage.addListener(function(request, sender, senderResponse){
		qqBot.changeSwitch();
		console.log("QQ robot status: " + qqBot._switch);
		alert("QQ robot status: " + qqBot._switch);
		senderResponse({status:qqBot._switch});
		if (qqBot._switch)
			window.open(document.URL, "_self");
	});
}
main();