---
layout: post
title: Swift3.0 中 Strings/Characters 闲聊
date: 2017-02-19 18:37:00.000 +09:00
---

![unicode-latin-extended-additional](/assets/images/2017/unicode-latin-extended-additional.png)

## 前言 

本篇文章主要浅析字符串\字符在 Swift 和 Objective-C 之间的区别及其简单用法。如有不妥的地方还望大家及时帮忙纠正。

## 字符串判空

在 swift 语言中空字符串初始化方式常用的有两种：

```
// 方式一：
let testEmptyString0 = ""

// 方式二：
let testEmptyString1 = String()

```

在开发过程中，我们应该如何用正确的方式来对字符串进行判空处理呢？

```

// 方式一：这种方式其实就是判断 characters.count 是否为0
if testEmptyString0.isEmpty {
    // empty
}

// 方式二：
if testEmptyString0.characters.count {
    // empty
}

// 方式三：
if (testEmptyString0 as NSString).length {
    // empty
}

```

## 字符串长度计算

### Objective-C

首先我们来回忆一下，在 Objective-C 中字符串是怎么计算长度的？我想大家都应该知道。来看看苹果是怎么说的：

> A string object is implemented as an array of Unicode characters (in other words, a text string). An immutable string is a text string that is defined when it is created and subsequently cannot be changed. To create and manage an immutable string, use the NSString class. To construct and manage a string that can be changed after it has been created, use NSMutableString.

> A string object presents itself as an array of Unicode characters. You can determine how many characters it contains with the length method and can retrieve a specific character with the characterAtIndex: method. 


看完这段话，想必大家都明白 NSString 是怎么实现的，以及如何获取其长度。通过 length 方法即可，那么 length 方法是如何实现的呢？苹果官方是这样说的：length 方法利用的是 UTF-16 表示的十六位编码单元数字为单位进行计算的（The number of UTF-16 code units in the receiver.）。UTF-16是什么？（感兴趣的童鞋可以看一下我之前写的一篇文章，[字符编码（一）](https://tingxins.com/2017/01/character-encoding-01/)），此处不再详述。

### Swift 3.0

#### Unicode 标量表示

在 Swift 中，字符和字符串都是基于 Unicode 标量建立的，采用21位二进制进行编码，共17个平面（除了基本多文种平面中的 UTF-16 代理对码位外，即U+D800至U+DFFF的编码空间），也就是说编码范围是U+0000-U+D7FFF 或者 U+E000-U+10FFFF。

> A Unicode scalar is any Unicode code point in the range U+0000 to U+D7FF inclusive or U+E000 to U+10FFFF inclusive. Unicode scalars do not include the Unicode surrogate pair code points, which are the code points in the range U+D800 to U+DFFF inclusive.”

因此在 Swift 中，我们可直接采用 Unicode 标量的形式来表示字符或字符串，如：

```

let tingC = "\u{542C}" // 听

let xinC = "\u{5FC3}" // 心
 
```

#### 可扩展的字形群集（簇）
 
在 Swift 中，每一个 Character 类型实例都代表单个可扩展的字形群集——即由一个或多个 Unicode 标量的序列组成的一个可读字符。

汉字 “听” 拼音为 tīng，以字母 ī 为例，用两种方式表示。第一种，可以直接用单个 Unicode 标量 ī (LATIN SMALL LETTER I WITH MACRON) 来表示，即 U+012B，该字形群集中包含一个 Unicode 标量。第二种，可以采用两个 Unicode 标量来表示，一个拉丁字母 i (LATIN SMALL LETTER I) 加上一个音调符（元音，COMBINING MACRON ACCENT）的标量，即 U+0069 U+0304，这样，当字母 i 被 Unicode 文字渲染系统时就会转换成 ī，该字形群集中包含两个 Unicode 标量。

```

let tingO = "t" + "\u{0069}" + "ng" // Prints "ting "

let tingPS = "t" + "\u{0069}" + "\u{0304}" + "ng" // Prints "tīng"

let tingPD = "t" + "\u{012B}" + "ng" // Prints "tīng"

```

这两种情况中，字母 ī 即代表了 Swift 中单个 Character 类型实例，也代表了一个可扩展的字形群集。[想了解更多关于可扩展的字形群集，可参考此链接](http://unicode.org/reports/tr29/#Default_Grapheme_Cluster_Table)。

#### 字符串长度

我们已经简单了解了可扩展的字形群集，现在我们再来看看 Swift 字符串中一些有意思的事。

Swift 中 String 类型，说白了就是 Character 类型实例的集合，在开发过程中，我们一般采用两种方式来求字符串的长度，第一种是转成 Objective-C 中的 NSString 类型，通过 length 方法来获取其长度，第二种是通过字符串属性 characters.count 的方式获得。本小节主要讨论第二种，本文会在结尾针对这两种方式进行比较。

在 Swift 中，细心的同学或许已经发现 tingPD 与 tingPS 字符串的字符数量是一样的：

```

print("tingPD-Count:\(tingPD.characters.count), tingPS-Count:\(tingPS.characters.count)") 
// Prints "tingPD-Count:4, tingPS-Count:4"

```

下面我们来解决此疑惑，笔者已在前文说过，Swift 中 String\Character 都是基于 Unicode 标量建立的，且 String 是 Character 的集合（即包含关系），而 String 属性 characters.count 其实就是计算 Character 的数量，那么 character 是怎么定义的呢，或者说什么才算是一个 character？此时又引出了一个概念——字形群集界限（Grapheme Cluster Boundaries），而”什么才算是一个 character？“这个问题就是字形群集界限给出的答案，想深入了解的同学请看：[传送门](http://unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries)。从用户感观（user-perceived）角度讲，不管是字符 ī(U+012B) 或者是 i(U+0069) 再加上一个音调符（U+0304），这两种表示最终的结果都是组成一个相同的可读的字符，因此 tingPD 与 tingPS 字符串中的字符数量是一样的。

通过上文的简单解释，可以得出两个结论：

1. 一个字符串拼接一个字符时，不一定会更改字符串的数量，即 characters.count 的值。

2. 在没有获取到字形群集界限的时候，无法计算出该字符串的字符数量，因此必须遍历字符串中全部的 Unicode 标量以获取字形群集界限，进而确定字符串的字符数量。

下面在看一个例子，相信大家都已明白输出结果的原因：

```

var iWord = "i"

print("iword-Count: \(iWord.characters.count)")
// Prints "iword-Count: 1"

iWord += "\u{0304}" // ī
print("iword-Count: \(iWord.characters.count)")
// Prints "iword-Count: 1"

```

### .length 与 .characters.count 的区别

首先 .length 是 Objective-C 中字符串长度计算方法，而 .characters.count 可以说是 Swift 中字符串长度计算方法，由于 Swift 中 String 类型可以转成 Objective-C 中的 NSString 类型，因此在 Swift 开发过程中可能有如下两种写法：

```

print("tingPS.characters.count")
// Prints "4"
print("(tingPS as NSString).length")
// Prints "5"

```

从上述结果可看出，.length 方法得到的字符串长度为5，而 .characters.count 等于4，可能读者会有点懵，同一个字符串怎么计算的长度不一致？其实 .length 与 .characters.count 的计算原理在上文已经做了解释，本小节就简单总结一下：

.length 与 .characters.count 返回值不总是相同的，.length 方法是采用 UTF-16 表示的编码单元为单位进行计算并返回的，即字母 i(U+0069) 、音调符（U+0304）会当做两个字符，因而长度为2。.character.count 的值是通过字形群集界限来确定字符数量的，如还不理解请查看上文。（PS：其实这里也是 Swift 中采用索引的方式访问字符串的原因）

