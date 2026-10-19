# 文本搜索高亮

一个纯前端的文本、表格和 JSON 搜索整理工具，可直接部署到 GitHub Pages。

## 数据存储

- 用户导入、粘贴和编辑的数据只保存在当前电脑浏览器的 IndexedDB 或 localStorage 中。
- 网站不会把这些数据提交到 GitHub，也没有后端服务器。
- 不同电脑、不同浏览器或不同域名之间的数据不会自动同步。
- 清除该网站的浏览器数据会删除本地保存的内容。

## 本地使用

直接打开 `index.html` 即可。

## GitHub Pages

仓库发布为 GitHub Pages 后，使用 `https://<用户名>.github.io/<仓库名>/` 访问。
