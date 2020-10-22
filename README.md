# PageTalk
鉴于 [Gitalk](https://gitalk.github.io/) 在国内调用 Github API 速度太慢，自行开发了一款基于 [LeanCloud](https://leancloud.cn/) 存储的无后端评论系统。示例：https://seatwork.github.io/pagetalk.js/

## 系统特点

- **代码非常少**：除依赖项 MD5 和 Marked（两者均自动加载）以外，PageTalk 本身代码压缩后仅 K，其中 JS，CSS。

- **速度非常快**：主要得益于 Marked 的卓越性能和 LeanCloud 的高速网络，如果在境外使用，可以尝试替换成 LeanCloud 国际版。

- **使用非常方便**：寥寥数行代码即可在任何页面上添加评论功能。

- **功能非常简单**：由于目前仅针对个人博客使用，功能相比其他同类项目更为简单，例如不支持表情、不支持国际化、不支持多级回复、不支持语法高亮、不支持分页等等，适合对评论功能要求不多的个人网站或博客使用。

- **无后端实现**：纯浏览器端版本。修改和删除数据需在 LeanCloud 后台操作。

## 使用方法

1. 注册 [LeanCloud](https://leancloud.cn/) 账号，获取 AppID 和 AppKey；
2. 在需要添加评论的页面放置如下代码即可：
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/seatwork/pagetalk.js/pagetalk.min.css"/>
<script src="https://cdn.jsdelivr.net/gh/seatwork/pagetalk.js/pagetalk.min.js"></script>

<div id="pagetalk"></div>
<script>
new PageTalk({
  container: '#pagetalk',
  appId: '<YOUR LEANCLOUD APP_ID>',
  appKey: '<YOUR LEANCLOUD APP_KEY>'
})
</script>
```

## 免费配额

LeanCloud 开发版免费配额如下：
- API请求：3万次/天 
- 并发线程：3个
- 数据存储空间：1GB

## 安全设置

将 AppID 和 AppKey 暴露在前端无疑存在巨大风险，好在 LeanCloud 提供了必要的安全防范措施，请务必在 LeanCloud 后台进行以下两项设置：
1. 设置 Web 安全域名；（防跨域调用）
2. 针对存储 Class 禁止所有用户的更新和删除权限；（防后端调用）

## 未尽事宜

1. Markdown 解析在特殊情形下还是有点问题，Marked 官网测试也是如此；
2. 任何问题请在 https://seatwork.github.io/pagetalk.js/ 下方留言。
