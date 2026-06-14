---
layout: post
title: iOS 跑马灯之 TXScrollLabelView
date: 2016-11-20 21:41:18.000 +09:00
---

# 前言

前段时间在开发一个广播的功能，网上也自己找了一些库，没有发现非常好用的，于是自己抽时间写了一个，发布一天收获六十多个 `star`，这里首先感谢大家在微博上的转发，使得 [`TXScrollLabelView`](https://github.com/tingxins/TXScrollLabelView)  被更多需要的人知道，同时非常感谢大家的吐槽及建议，使之诞生 [`TXScrollLabelView`](https://github.com/tingxins/TXScrollLabelView) v1.1.1 版本，目前已支持 `CocoaPods`，后续会增加 `Carthage`。Github 地址: [TXScrollLabelView](https://github.com/tingxins/TXScrollLabelView) 

```
pod search TXScrollLabelView

-> TXScrollLabelView (1.1.1)
   The best way to show & display such as adverts,boardcast,OnSale e.g. with a
   customView.
   pod 'TXScrollLabelView', '~> 1.1.1'
   - Homepage: https://github.com/tingxins/TXScrollLabelView
   - Source:   https://github.com/tingxins/TXScrollLabelView.git
   - Versions: 1.1.1 [master repo]
```

## TXScrollLabelView ？

`TXScrollLabelView` 是一个能够快速接入自定义标签滚动视图，可以做促销栏、头条栏、广播栏、广告栏等等展示，效果图：

![scrolling-txscrolllabelview-jd][1]

![scrolling-txscrolllabelview-ka][2]

![scrolling-txscrolllabelview-un][3]

[1]:/assets/images/2016/scrolling-txscrolllabelview-jd.gif

[2]:/assets/images/2016/scrolling-txscrolllabelview-ka.gif

[3]:/assets/images/2016/scrolling-txscrolllabelview-un.gif

## 支持滚动类型

现在 `TXScrollLabelView` 支持4种滚动类型：

- `TXScrollLabelViewTypeLeftRight`：从右向左单行滚动

- `TXScrollLabelViewTypeUpDown`：从下至上多行滚动

- `TXScrollLabelViewTypeFlipRepeat`：从下至上单行循环滚动

- `TXScrollLabelViewTypeFlipNoRepeat`：从下至上单行依次滚动

前几天 `GitHub` 有人提出 `scrollVelocity` 针对相关类型失效问题，现在已经全部解决，以上四种类型 `scrollVelocity` 全部支持啦。后期会持续增加更多的功能，满足更多的需求。

## 如何接入 ？

目前支持两种方式集成 `TXScrollLabelView`:

- 使用 `cocoaPods`

         platform :ios, '7.0'
         pod 'TXScrollLabelView'
         
- 手动
    
    `Clone` 或者 `DownloadZip` 至本地，然后手动拖拽 `TXScrollLabelView` 文件夹中的文件至项目中，使用的时候 `#import "TXScrollLabelView.h“` 即可。
    
    
## 如何使用 ？

```
//1.获取滚动的内容
NSString *scrollTitle = @"xxxxxx";
//2.创建TXScrollLabelView
TXScrollLabelView *scrollLabelView = [TXScrollLabelView scrollWithTitle:scrollTitle type:0 velocity:3 options:UIViewAnimationOptionTransitionFlipFromTop];
//3.开始滚动
[scrollLabelView beginScrolling];
```

更多请详见Demo：<https://github.com/tingxins/TXScrollLabelView/tree/master/TXScrollLabelViewDemo>
    
## 广告

欢迎关注微信公众号

![wechat-qrcode](http://image.tingxins.cn/adv/wechat-qrcode.jpg)

    





