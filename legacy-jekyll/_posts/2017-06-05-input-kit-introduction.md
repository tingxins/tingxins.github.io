---
layout: post
title: iOS 输入限制之 InputKit
date: 2017-06-29 00:22:00.000 +09:00
---

![InputKit-logo](http://image.tingxins.cn/InputKit/InputKit-logo2-dynamic.gif)

# 前言

最近接手了两个 O2O 的老项目，其中的 Bug 也不言而喻，单看项目中的布局就有 n 种不同的方式，有用纯代码的，有用 Masonry 的，有用 VFL 的，也有用 Xib 的，更有用代码约束等等等，🐮。不扯远了，回归正题。

由于这两个项目是 O2O 项目，因此针对输入组件的限制相比其他类型的项目要多一些，比如商品价格输入（如：保留3位整数，2位小数等）、买家留言字数限制、不能输入中文、不能输入英文、只能输入数字等等限制。

于是输入限制 [InputKit](https://github.com/tingxins/InputKit) 诞生了！本文主要简单介绍 [InputKit](https://github.com/tingxins/InputKit) 的使用及相关注意事项。

# [InputKit](https://github.com/tingxins/InputKit)

[InputKit](https://github.com/tingxins/InputKit) 是一个轻量级的，专门用于做输入限制的第三方库，灵感源自 [BlocksKit](https://github.com/BlocksKit/BlocksKit)，在项目中，主要为了解决三个问题：

- 解耦
- 需求
- Bug

## 解耦

所谓解耦，即在开发项目中工程师不需要仅仅只为做个输入限制，就在项目中到处写 UITextFieldDelegate 协议中的方法，如：

```

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
    // Coding
}

```

只需继承 [InputKit](https://github.com/tingxins/InputKit) 中的类即可，然后设置相关的限制属性即可，无需设置 delegate。以 TXLimitedTextFieldTypePrice 类型为例，如：

**Objective-C**

```

// 创建 TXLimitedTextField 实例
TXLimitedTextField *textField = [[TXLimitedTextField alloc] initWithFrame:CGRectMake(20, 200, 100, 30)];
// 如 limitedType 不设置，默认 TXLimitedTextFieldTypeDefault
textField.limitedType = TXLimitedTextFieldTypePrice;
// 限制 10 的输入长度
textField.limitedNumber = 10;
// 保留 5 位整数位
textField.limitedPrefix = 5;
// 保留 2 位小数位
textField.limitedSuffix = 2;
[self.view addSubview:textField];

```

**Swift**

```

let textField = LimitedTextField(frame: CGRect(x: 20, y: 200, width: 100, height: 30))
textField.limitedType = .price
textField.limitedNumber = 10
textField.limitedPrefix = 5
textField.limitedSuffix = 2
view.addSubview(textField)

```

如果想设置 textField 的 delegate 也可以（即 textField.delegate = self），不会影响其限制功能，就像使用普通的 UITextField 一样，毫无差异，非常方便。

**Demo 截图：**

![inputKit-demo-price](http://image.tingxins.cn/InputKit/inputKit-demo-price.gif)

## 需求

文章开头提到过，需求即针对商品价格输入（如：保留3位整数，2位小数等）、买家留言字数限制、不能输入中文、不能输入英文、只能输入数字等等做限制。

如果针对上述的部分需求做定制键盘，是完全没必要的，因为工作量增多且并不能从源头解决问题，比如：用户使用粘贴功能、使用键盘提示文本等等，导致定制的键盘也是白搭。因此 InputKit 从源头解决该问题，针对用户的输入进行筛选并限制。比如我们只能让用户输入中文：

**Objective-C**

```

TXLimitedTextField *textField = [[TXLimitedTextField alloc] initWithFrame:CGRectMake(20, 200, 100, 30)];

// 自定义输入限制类型
textField.limitedType = TXLimitedTextFieldTypeCustom;

// 限制最大输入长度
textField.limitedNumber = 10;

// limitedRegExs 是一个数组类型的参数，数组元素类型即正则表达式，如：kTXLimitedTextFieldChineseOnlyRegex 是一个常量，其值为：“^[\u4e00-\u9fa5]{0,}$”，即代表匹配中文的正则
textField.limitedRegExs = @[kTXLimitedTextFieldChineseOnlyRegex];

[self.view addSubview:textField];

```

（**Swift 代码略**）

关于上述的正则表达式，在 InputKit 中的 TXMatchConst.h 头文件中提供了一些常用的，比如：只能输入数字、中文、字母等等，欢迎大家在 GitHub 上 PR。（注意：此处的正则表达式限制的是输入源头，而非结果！不然会导致用户无法输入。体会一下哈）。

**Demo 截图：**

![inputKit-demo-custom](http://image.tingxins.cn/InputKit/inputKit-demo-custom.gif)

## Bug

在没使用 [InputKit](https://github.com/tingxins/InputKit) 之前，有时候，运行到程序的某处，点击输入框，程序莫名其妙的卡死，过会儿就闪退了。相信不少人遇到过，后来发现是 self.delegate = self（self 即输入框对象） 导致的。注释后，发现没问题，打开后，程序又闪退，后来发现原来是 self.delegate = self 引起的死循环，因此不得不注释该句代码。

上述的这些问题，如：在项目中 UITextFieldDelegate 协议方法遍地都是，以及一不小心使用了 self.delegate = self 时，还会出现死循环等等，[InputKit](https://github.com/tingxins/InputKit) 都解决了。

使用 [InputKit](https://github.com/tingxins/InputKit) 后，self.delegate = self 程序不再卡死。（晚点会再发一篇软文针对 self.delegate = self 的问题进行剖析）。

至此，需求、Bug 均已解决。👀


## 开源

GitHub 项目及 Demo 地址：https://github.com/tingxins/InputKit。有什么问题或者更好的建议，直接提 issue 或者 PR。


## 广告

欢迎关注微信公众号

![wechat-qrcode](http://image.tingxins.cn/adv/wechat-qrcode.jpg)

