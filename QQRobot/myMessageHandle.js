/* 消息处理过程 注：这个文件在manifest.json中需要放在contentScript.js前面 */

//图灵机器人回复
var tulingKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";//your tuling robot key
function tulingReply(bot, msg)
{
	bot.lock();
	
	$.ajax({
        type: "post",
        url: "http://www.tuling123.com/openapi/api",
//      data: "para="+para,  此处data可以为 a=1&b=2类型的字符串 或 json数据。
        data: {"key":tulingKey, 'info':msg['message'], 'userid':msg['fromUserId']},
        cache: false,
        async : false,
        dataType: "json",
        success: function (data, textStatus, jqXHR)
        {
            //console.log(data);
			if (data['code'] == 100000)
			{
				if (msg['group'] == 0)
					bot.sendMessage(data['text']);
				else
					bot.sendMessage("Robot:" + data['text']);
			}
			
			bot.unLock();
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) {      
            //alert("请求失败！");
			console.log("error:" + textStatus);
			bot.unLock();
        }
     });
}

//持久化存储图灵机器人的运行状态
var localStorage = {};
if(window.localStorage)
	localStorage = window.localStorage;
if (localStorage['tuling_running'] == undefined || 
	localStorage['tuling_running'] == null)
{
	localStorage['tuling_running'] = "1";
}

//轮询消息句柄
function myMessageHandle(bot, msg)
{	
	var targetInfo = bot.getCurrentChatTargetInfo();
	console.info(targetInfo['title']);
	
	if (msg['message'] == "robot:stop")
	{
		localStorage['tuling_running'] = "0";
		bot.sendMessage("Robot:stopped");
		return ;
	}
	else if (msg['message'] == "robot:start")
	{
		localStorage['tuling_running'] = "1";
		bot.sendMessage("Robot:started");
		return ;
	}
	
	if (localStorage['tuling_running']=="1" && msg['message'].indexOf("Robot:") < 0)
		tulingReply(bot, msg);
}

//注册
function registerMessageHandle()
{
	return myMessageHandle;
}