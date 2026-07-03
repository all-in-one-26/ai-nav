---
title: AI Nav
emoji: 🧭
colorFrom: blue
colorTo: cyan
sdk: docker
app_port: 7860
pinned: false
---

# AI Nav

AI 工具导航站，收录 1900+ AI 工具，支持搜索、分类浏览、工具提交。

## 部署

### Docker

```bash
docker run -d --name ai-nav --restart always -p 6412:6412 -v /path/to/data:/app/data ai-nav
```

- 默认端口 6412
- 默认账号密码 admin admin，第一次运行后请进入后台修改
- 数据库自动创建在 `/app/data/nav.db`
