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
//是否开启图灵回复
if (localStorage['tuling_running'] == undefined || 
	localStorage['tuling_running'] == null)
{
	localStorage['tuling_running'] = "1";
}
//是否开启群回复
if (localStorage['tuling_reply_group'] == undefined || 
	localStorage['tuling_reply_group'] == null)
{
	localStorage['tuling_reply_group'] = "1";
}

//轮询消息句柄
function myMessageHandle(bot, msg)
{	
	var targetInfo = bot.getCurrentChatTargetInfo();
	console.info(targetInfo['title']);
	
	var cmd = msg['message'].toLowerCase();
	if (cmd == "robot:help")
	{
		bot.sendMessage(
		"机器人命令\n帮助：robot:help\n开启：robot:start\n关闭：robot:stop\n开启群：robot:startgroup\n关闭群：robot:stopgroup\n\n机器人源码：https://github.com/gergul/QQRobotChromeExtension"
		);
		return ;
	}
	else if (cmd == "robot:stop")
	{
		localStorage['tuling_running'] = "0";
		bot.sendMessage("Robot:stopped");
		return ;
	}
	else if (cmd == "robot:start")
	{
		localStorage['tuling_running'] = "1";
		bot.sendMessage("Robot:started");
		return ;
	}
	else if (cmd == "robot:stopgroup")
	{
		localStorage['tuling_reply_group'] = "0";
		bot.sendMessage("Robot:group stopped");
		return ;
	}
	else if (cmd == "robot:startgroup")
	{
		localStorage['tuling_reply_group'] = "1";
		bot.sendMessage("Robot:group started");
		return ;
	}
	
	//不进行消息处理
	if (localStorage['tuling_running'] == "0" || 
		(msg['group'] == 1 && localStorage['tuling_reply_group'] == "0") ||
		msg['message'].toLowerCase().indexOf("robot:") == 0 )
	{
		return ;
	}

	//进行图灵回复
	tulingReply(bot, msg);
}

//注册
function registerMessageHandle()
{
	return myMessageHandle;
}