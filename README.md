# Make Your Page Talk

## 开始使用

### 1. 准备账号
注册 [LeanCloud](https://leancloud.cn/) 账号，获取 AppID 和 AppKey；

### 2. 添加代码
在任何需要添加评论的页面放置如下代码即可：

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/gh/seatwork/pagetalk/pagetalk.min.css"/>
<script src="//cdn.jsdelivr.net/gh/seatwork/pagetalk/pagetalk.min.js"></script>

<div id="pagetalk"></div>
<script>
new PageTalk({
  container: '#pagetalk',
  appId: '<YOUR LEANCLOUD APP_ID>',
  appKey: '<YOUR LEANCLOUD APP_KEY>'
})
</script>
```

### 3. 选项设置

| 属性 | 类型 | 默认值 | 备注 |
| --- | --- | --- | --- |
| container | string | null | 必需，PageTalk 所在的页面容器 |
| appId | string | null | 必需，LeanCloud 账号的 AppID |
| appKey | string | null | 必需，LeanCloud 账号的 appKey |
| className | string | 'PageTalk_Comment' | 可选，LeanCloud 存储表名 |
| onMessage | function | null | 可选，评论提交成功后的回调函数，常用于发送提醒等 |

## 免费配额

LeanCloud 开发版免费配额如下：
- API请求：3万次/天 
- 并发线程：3个
- 数据存储空间：1GB

## 安全设置

!> 将 AppID 和 AppKey 暴露在前端存在巨大风险，请务必在 LeanCloud 后台进行如下设置。

1. 设置 Web 安全域名；（防跨域调用）
2. 针对存储：将更新和删除权限设置为登录用户；（防后端调用）
3. 针对存储：禁止客户端创建 Class；（根据需要）

## 系统特点

### 1. 代码非常少
除依赖项 MD5 和 Marked（两者均自动加载）以外，PageTalk 本身 JS+CSS 代码压缩后大约 10KB。

### 2. 速度非常快
主要得益于 Marked 的卓越性能和 LeanCloud 的高速网络，如果在境外使用，可以尝试注册 LeanCloud 国际版。代码方面，则尽可能保持纯净和原生。

### 3. 使用非常方便
理论上可以在任何页面上添加 PageTalk 评论功能，只需寥寥几行代码。

### 4. 功能非常简单
由于目前仅针对个人博客使用，功能相比其他同类项目更为简单，例如不支持表情、不支持国际化、不支持多级回复、不支持语法高亮、不支持分页等等，修改和删除数据需在 LeanCloud 后台操作。适合对评论功能要求不高的个人网站或博客使用。

### 5. 无后端实现
纯浏览器端版本，无需后台服务器支持（LeanCloud 除外）。

## 问题反馈
任何问题或建议请在下方留言。
