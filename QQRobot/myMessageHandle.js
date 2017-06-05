/* 消息处理过程 注：这个文件在manifest.json中需要放在contentScript.js前面 */

//图灵机器人回复
var tulingKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";//your tuling robot key
function tulingReply(bot, msg, userid)
{
	bot.lock();
	
	$.ajax({
        type: "post",
        url: "http://www.tuling123.com/openapi/api",
//      data: "para="+para,  此处data可以为 a=1&b=2类型的字符串 或 json数据。
        data: {"key":tulingKey, 'info':msg, 'userid':userid},
        cache: false,
        async : false,
        dataType: "json",
        success: function (data, textStatus, jqXHR)
        {
            //console.log(data);
			if (data['code'] == 100000)
			{
				bot.sendMessage(data['text']);
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

var tuling_running = true;

//轮询消息句柄
function myMessageHandle(bot, msg)
{	
	var targetInfo = bot.getCurrentChatTargetInfo();
	console.info(targetInfo['title']);
	
	if (msg['message'] == "robot:stop")
	{
		tuling_running = false;
		bot.sendMessage("Robot:stopped");
		return ;
	}
	else if (msg['message'] == "robot:start")
	{
		tuling_running = true;
		bot.sendMessage("Robot:started");
		return ;
	}
	
	if (tuling_running)
		tulingReply(bot, msg['message'], msg['fromUserId']);
}

//注册
function registerMessageHandle()
{
	return myMessageHandle;
}