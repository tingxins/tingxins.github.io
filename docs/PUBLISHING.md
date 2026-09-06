# 本地预览与发布

核实日期：2026-09-06。

## 发布归属

本站为 Jekyll 项目，仓库为 `tingxins/tingxins.github.io`，生产域名为 `https://midaigc.com/`。GitHub Pages 当前使用 legacy branch build，来源是 `master` 分支根目录 `/`。推送该分支会自动构建并发布，无需额外上传 `_site`。

用户口语中的 main 通常指默认分支；发布前查询实际默认分支及 Pages source。不要为了名称一致而创建 main 或修改发布设置。

`blog.tingxins.cn` 是另一个 Hexo 项目，本站导航链接到它不代表本仓库负责发布它。Cloudflare 代理也不代表本站使用 Cloudflare Pages。

## 本地构建

使用与 Gemfile.lock 兼容的 Ruby 和 Bundler；本机验证可用 Ruby 3.3.1。先检查 `ruby -v` 与 `bundle -v`。如果 RVM 未初始化导致系统 Ruby 2.6 加载 Ruby 3.3 的 gems，可显式使用已有运行时：

```sh
/Users/tingxins/.rvm/rubies/ruby-3.3.1/bin/ruby /Users/tingxins/.rvm/gems/ruby-3.3.1/bin/bundle exec jekyll build --destination /private/tmp/tingxins-release-build
```

正常环境使用：

```sh
bundle exec jekyll build --destination /private/tmp/tingxins-release-build
git diff --check
bundle exec jekyll serve --host 127.0.0.1 --port 4000 --no-watch
```

本地地址为 `http://127.0.0.1:4000/`。配置或代码变化后，使用 `--no-watch` 的服务需要重启。不要为修复 shell 环境问题直接升级所有依赖。

## 发布步骤

1. 检查 `git status --short --branch`、差异和远端，保留未授权的 IDE 等改动；只暂存本次发布文件。
2. 查询默认分支及 Pages 来源：

   ```sh
   git ls-remote --symref origin HEAD
   gh api repos/tingxins/tingxins.github.io/pages --jq '{build_type,source,cname,status}'
   git fetch origin
   ```

3. 完成构建与变更相关检查。favicon 必须引用真实存在的图片，声明类型与文件一致，且图标必须进入构建产物。产品页是独立 HTML，需单独检查其 head。
4. 已获得提交、推送、发布授权后提交指定文件。若工作在其他分支，先检查与默认分支差异，再合入；已在默认分支则直接提交，无需制造合并。远端有新增提交时先安全同步，禁止强推。
5. 推送当前确认的发布分支（目前 `git push origin master`），记录完整提交 SHA。
6. 查询 Pages 构建，间隔约 20–30 秒；只有 `commit` 等于本次 SHA 且 `status` 为 `built` 才算构建完成。失败时读取错误，不能将 push 成功当作发布成功。

   ```sh
   gh api repos/tingxins/tingxins.github.io/pages/builds/latest --jq '{status,commit,error,updated_at}'
   ```

7. 检查生产域名返回的实际 HTML 和变更资源，必要时使用带提交 SHA 的查询参数区分缓存；同时检查普通 URL。favicon 验收包括声明、HTTP 200、图片类型与实际内容。浏览器图标缓存可能滞后，应在新标签页复核，不能以缓存推断部署失败。
8. 汇报提交、分支、构建状态、线上验证与未处理改动。

## 当前行为约束

- 首页不输出旧文章列表，`/#blog` 返回首页；`/page/2/` 应为 404，`feed.xml` 无文章项。已知旧文章详情仍可访问。
- 头像及产品按钮使用产品转场；移动主导航纵向展示。
- favicon 使用 `/assets/images/avatar.jpg`（JPEG）；不要引用不存在的 `favicon.png`。
- 博客按钮仍使用历史 HTTP www 地址；其 HTTPS 证书问题需作为独立修复处理，不与图标发布混入。

## 回滚

确认回滚范围和授权后，对目标提交使用 `git revert <sha>` 创建可审查的反向提交，重新构建、推送并按相同步骤验收。不要重置或强推发布分支。旧版本回滚可能重新暴露文章列表，回滚前必须检查差异。
