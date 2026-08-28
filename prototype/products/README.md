# Products page prototype

一次性视觉原型，用于回答：“三个独立产品的正式列表页应该采用哪一种结构？”

在仓库根目录运行：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

然后访问：

- `http://127.0.0.1:8765/prototype/products/?variant=studio&lang=zh`
- `http://127.0.0.1:8765/prototype/products/?variant=editorial&lang=zh`
- `http://127.0.0.1:8765/prototype/products/?variant=galaxy&lang=zh`

底部 Prototype 控制器或键盘左右键用于切换方案，右上角切换中英文。方案确定后，应删除落选方案与控制器，并将胜出方向重写为正式 `/products/` 页面。
