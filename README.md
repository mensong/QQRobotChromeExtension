# QQRobotChromeExtension
A QQ robot chrome extension

基于web qq使用了一种比较简单的方式实现了QQ机器人，过程中没有使用复杂的web接口，仅仅使用了html dom操作实现的。

本例对接了图灵机器人自动问答，消息接口实现在myMessageHandle.js中，请在此文件中替换你的图灵key.


特色：

  1、不使用复杂的webqq接口，避免腾讯更改了接口就不能使用的尴尬；
  
  2、纯粹的html dom操作让一切一目了然；
  
  3、部署简单，只需一个浏览器（chrome内核的）就可以超快速部署。


安装：

  1、打开chrome的“扩展程序”中的“开发者模式”；
  
  2、“加载已解压的扩展程序...”，选择“QQRobot”文件夹；
  
  3、打开“w.qq.com”，使用手机扫码登录即可。
  
