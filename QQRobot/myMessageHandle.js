/* 消息处理过程 注：这个文件在manifest.json中需要放在contentScript.js前面 */

//图灵机器人回复
// 官网：http://www.tuling123.com
var tulingKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";//your tuling robot key
function tulingReply(bot, msg)
{
	bot.lock();
	
	$.ajax({
        type: "post",
        url: "http://www.tuling123.com/openapi/api",
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

//茉莉机器人回复
//  官网：http://www.itpk.cn
//  使用了公共api，因此不需要指定apikey
function isJSON(str) 
{
    if (typeof str == 'string')
	{
        try 
		{
            JSON.parse(str);
            return true;
        } catch(e) {
            console.log(e);
            return false;
        }
    }
	
	return false;
}

function itpkReply(bot, msg)
{
	bot.lock();
	
	$.ajax({
        type: "get",
        url: "http://i.itpk.cn/api.php?question=" + msg['message'],
        success: function (data, textStatus, jqXHR)
        {
			var ret;
			try
			{
				var j = JSON.parse(data);
				if (j["type"] == "观音灵签")
				{
					ret = "你合十跪拜后求得的签：\n";
					ret += "签号：" + j['number1'];
					ret += "为【" + j['haohua'] + "】。\n";
					ret += "签上写着：" + j['qianyu'] + "\n";
					ret += "解签：" + j['shiyi'] + "（" + j['jieqian'] + "）\n";
				}
				else if (j["type"] == "月老灵签")
				{
					ret = "你合十跪拜后求得的签：\n";
					ret += "签号：" + j['number1'];
					ret += "为【" + j['haohua'] + "签】。\n";
					ret += "签上写着：" + j['shiyi'] + "\n";
					ret += "解签：" + j['jieqian'] + "（" + j['baihua'] + "）\n";
					ret += "注释：" + j['zhushi'] + "\n";
				}
				else if (j["type"] == "财神爷灵签")
				{
					ret = "你合十跪拜后求得的签：\n";
					ret += "签号：" + j['number1'];
					ret += "为【" + j['zhushi'] + "签】。\n";
					ret += "签上写着：" + j['qianyu'] + "\n";
					ret += "解签：" + j['jieqian'] + "（" + j['jieshuo'] + j['jieguo'] + "）\n";
					ret += "婚姻：" + j['hunyin'] + "\n";
					ret += "事业：" + j['shiye'] + "\n";
					ret += "功名：" + j['gongming'] + "\n";
					ret += "失物：" + j['shiwu'] + "\n";
					ret += "出外移居：" + j['cwyj'] + "\n";
					ret += "六甲：" + j['liujia'] + "\n";
					ret += "求财：" + j['qiucai'] + "\n";
					ret += "交易：" + j['jiaoyi'] + "\n";
					ret += "疾病：" + j['jibin'] + "\n";
					ret += "诉讼：" + j['susong'] + "\n";
					ret += "运途：" + j['yuntu'] + "\n";
					ret += "某事：" + j['moushi'] + "\n";
					ret += "合伙做生意：" + j['hhzsy'] + "\n";
				}
			}
			catch(e)
			{
				ret = data;
			}
			
            bot.sendLongMessageAndUnlockAfter(ret);
			//bot.unLock();使用了sendLongMessageAndUnlockAfter就不可以在这里unlock了
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) {      
            //alert("请求失败！");
			console.log("error:" + textStatus);
			bot.unLock();
        }
     });
}

var reply = {
	"tuling":tulingReply,
	"itpk":itpkReply,
};

//持久化存储图灵机器人的运行状态
var localStorage = {};
if(window.localStorage)
	localStorage = window.localStorage;
//是否开启图灵回复
if (localStorage['running'] == undefined || 
	localStorage['running'] == null)
{
	localStorage['running'] = "1";
}
//是否开启群回复
if (localStorage['reply_group'] == undefined || 
	localStorage['reply_group'] == null)
{
	localStorage['reply_group'] = "1";
}
//回复机器人选择
if (localStorage['robot'] == undefined || 
	localStorage['robot'] == null)
{
	localStorage['robot'] = "itpk";
}

function getStatusStr()
{
	var statusMsg = "Robot:\n==机器人状态==\n总开关：";
	if (localStorage['running'] == "1")
		statusMsg += "已开启";
	else
		statusMsg += "已关闭";
	statusMsg += "\n群自动回复：";
	if (localStorage['reply_group'] == "1" && localStorage['running'] == "1")
		statusMsg += "已开启";
	else
		statusMsg += "已关闭";
	if (localStorage['robot'] == "tuling")
		statusMsg += "\n图灵机器人在线";
	else
		statusMsg += "\n茉莉机器人在线";
	return statusMsg;
}

function isAtMe(bot, msg)
{
	var name = bot.getMyName();
	if (name == undefined)
		return false;
	if (msg["message"].indexOf("@" + name) > -1)
		return true;
	return false;
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
		"机器人命令\n帮助：robot:help\n开启：robot:start\n关闭：robot:stop\n开启群：robot:startgroup\n关闭群：robot:stopgroup\n查询状态：robot:status\n图灵机器人：robot:tuling\n茉莉机器人：robot:itpk\n\n机器人源码：https://github.com/gergul/QQRobotChromeExtension"
		);
		return ;
	}
	else if (cmd == "robot:stop")
	{
		localStorage['running'] = "0";
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == "robot:start")
	{
		localStorage['running'] = "1";
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == "robot:stopgroup")
	{
		localStorage['reply_group'] = "0";
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == "robot:startgroup")
	{
		localStorage['reply_group'] = "1";
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == "robot:status")
	{
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == "robot:tuling")
	{
		localStorage['robot'] = "tuling";
		bot.sendMessage("你好，我是图灵机器人。");
		return ;
	}
	else if (cmd == "robot:itpk")
	{
		localStorage['robot'] = "itpk";
		bot.sendMessage("你好，我是茉莉机器人。");
		return ;
	}
	
	//不进行消息处理
	if (localStorage['running'] == "0" || 
		(msg['group'] == 1 && localStorage['reply_group'] == "0") ||
		msg['message'].toLowerCase().indexOf("robot:") == 0 )
	{
		return ;
	}
	
	//处理@me
	if (msg['group'] == 1)
	{
		if (isAtMe(bot, msg))
		{
			/*
			 发现一个很奇怪的问题：
			    当你先发“@机器人 别的消息”的时候，只能够收到“@机器人”的消息，后面的内容没有了！
				这个应该是webQQ的bug
			*/
			var name = bot.getMyName();
			if (name != undefined)
				msg["message"] = msg["message"].
					replace("@" + name, "");
			if (msg["message"] == "")
				msg["message"] = "你好";
		}
	}
	
	//机器人回复
	var r = reply[localStorage['robot']];
	if (r)
		r(bot, msg);
}

//注册
function registerMessageHandle()
{
	return myMessageHandle;
}