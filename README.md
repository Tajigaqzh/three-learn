# qzh261112需求

## 策略到期时间通过定时任务同步到方正

### 星展后台

/operations/strategy-group-jcj/expire-export-record
新增路由 到期时间导出记录

支持选择时间，最多选择6个月

子组件
expire-export-record-detail

### 方正后台

新增路由
用户策略更新记录
operations/user-strategy-update-record

子组件
user-strategy-update-record-detail

### 方正移动端和pc

修改，加弹框
mobile/strategy/my-strategy
修改，加弹框
strategy/strategy-list

### 树懒后台

cd/web-admin

新增
/strategy/message-manage

## 策略支持一键停用+一键停用记录

### 事件上报

### 策略一键停用

mobile/user/user-center 修改，添加策略一键停用和一键停用记录

### 策略一键停用记录

webview新开页 新增路由
/mobile/user/strategy-stop-record

方正，后台也会新增一条记录不需要改动，但是要验证一下是否正常展示。

## 诚智投APP版支持日志导出-分享ZIP到微信

mobile/user/user-center

新增日志导出列表页
mobile/user/log-export

### 日志导入新开页

## 量化2.0系统管理后台支持富文本形式配置登录页面隐私协议。

/qt/privacy-agreement
修改

## 【新增】星展-行情中心：支持5分钟、15分钟、30分钟、60分钟、90分钟、120分钟 K线

修改
/quote-center/quote/stock-list

富文本编辑器支持功能

加粗
倾斜
下划线
删除线
格式刷
h1~h6标题
正文
列表
序号列表
字体演示
着重标题

对齐
表格（三方插件）
链接，

粘贴word
