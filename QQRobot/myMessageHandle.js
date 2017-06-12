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
//  可以使用公共api，因此可以不指定apikey
var itpkKey = "28f043e2501a28f1c9f54e85df430c3c";
var itpSecretKey = "gergul";
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
	
	var uri = "http://i.itpk.cn/api.php?question=" + msg['message'];
	if (itpkKey != "" && itpSecretKey != "")
		uri += "&api_key=" + itpkKey + "&api_secret=" + itpSecretKey;
	
	$.ajax({
        type: "get",
        url: uri,
        success: function (data, textStatus, jqXHR)
        {
			var ret;
			try
			{
				var j = JSON.parse(data);
				if (j["type"] == "观音灵签")
				{
					ret = "你合十跪拜后求得此签：\n";
					ret += "签号：" + j['number1'];
					ret += "为【" + j['haohua'] + "】。\n";
					ret += "签上写着：" + j['qianyu'] + "\n";
					ret += "解签：" + j['shiyi'] + "（" + j['jieqian'] + "）\n";
				}
				else if (j["type"] == "月老灵签")
				{
					ret = "你合十跪拜后求得此签：\n";
					ret += "签号：" + j['number1'];
					ret += "为【" + j['haohua'] + "签】。\n";
					ret += "签上写着：" + j['shiyi'] + "\n";
					ret += "解签：" + j['jieqian'] + "（" + j['baihua'] + "）\n";
					ret += "注释：" + j['zhushi'] + "\n";
				}
				else if (j["type"] == "财神爷灵签")
				{
					ret = "你合十跪拜后求得此签：\n";
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
				else if (j["title"] != undefined && j["content"] != undefined)
				{
					ret = "笑话：" + j["title"] + "\n";
					ret += j["content"];
				}
			}
			catch(e)
			{
				ret = "Robot:" + data;
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
	else if (localStorage['robot'] == "itpk")
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

var helpText = "机器人命令\n";
helpText += "帮助【:help】\n";
helpText += "开启【:on】\n";
helpText += "关闭【:off】\n";
helpText += "开启群【:gon】\n";
helpText += "关闭群【:goff】\n";
helpText += "查询状态【:status】\n";
helpText += "图灵机器人【:tuling】\n";
helpText += "茉莉机器人【:itpk】\n";
helpText += "\n机器人源码：https://github.com/gergul/QQRobotChromeExtension";

//轮询消息句柄
function myMessageHandle(bot, msg)
{	
	var targetInfo = bot.getCurrentChatTargetInfo();
	console.info(targetInfo['title']);
	
	var cmd = msg['message'].toLowerCase();
	if (cmd == ":help" || cmd == ":?" || cmd == ":？")
	{
		bot.sendMessage(helpText);
		return ;
	}
	else if (cmd == ":off")
	{
		localStorage['running'] = "0";
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == ":on")
	{
		localStorage['running'] = "1";
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == ":goff")
	{
		localStorage['reply_group'] = "0";
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == ":gon")
	{
		localStorage['reply_group'] = "1";
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == ":status")
	{
		bot.sendMessage(getStatusStr());
		return ;
	}
	else if (cmd == ":tuling")
	{
		localStorage['robot'] = "tuling";
		bot.sendMessage("已切换到图灵机器人\nRobot:你好，我是图灵机器人。");
		return ;
	}
	else if (cmd == ":itpk")
	{
		localStorage['robot'] = "itpk";
		var ret = "已切换到茉莉机器人\nRobot:你好，我是茉莉机器人。";
		ret += "\n我有特别的机器人指令，参见：http://www.itpk.cn/robot.php";
		bot.sendMessage(ret);
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

var scheduleDone = [];
var onTimeAlarmMinutes = [0, 30];//整点报时的分钟
function myScheduleHandle(bot)
{
	var targetInfo = bot.getCurrentChatTargetInfo();
	console.info(targetInfo['title']);
	if (targetInfo['title'] == "机器人小B交流群")
	{
		var now = new Date();
		var hours = now.getHours();
		var minutes = now.getMinutes();
		if (onTimeAlarmMinutes.indexOf(minutes) >= 0)//检查分钟是否为某时刻
		{
			var key = targetInfo['title'] + ":" + hours;
			if (scheduleDone.indexOf(key) < 0)
			{
				var txt = "整点报时：" + now;
				bot.sendMessage(txt);
				scheduleDone.push(key);
			}
		}
	}
}

//注册消息接口句柄
function registerMessageHandle()
{
	return myMessageHandle;
}
//注册时刻进度句柄
function registerScheduleHandle()
{
	return myScheduleHandle;
}