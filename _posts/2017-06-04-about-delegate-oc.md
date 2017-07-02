---
layout: post
title: self.delegate = self?
date: 2017-07-02 00:23:00.000 +09:00
---

## 前言

在 Objective-C 项目中，不少开发者们可能会写或者曾看到过这样的代码：

```

self.delegate = self

```

？？把自己的代理设置为自己？？这种做法到底妥不妥呢？

本文将采用自问自答、通俗易懂的方式讨论 `self.delegate = self` 这种做法是否妥当，以及这种做法将会带来的问题，或者说致命的问题。

## 为何这么写？

首先，我们先回顾一下 Delegate 的出现的原因是什么呢？再反思一下，我们为何会这么写呢？以及出现的场景有哪些？

笔者觉得 Delegate 模式其实就是 NSProxy 设计模式的一种衍生版，它们共同的特点可以理解为都是传递对象的消息，主要区别如下：

1. 两者消息传递方式不同，我们使用 NSProxy 会实现消息转发功能，而 Delegate 一般不会实现，仅作消息传递。
2. Delegate 是一对一的消息传递（A->B），而 NSProxy 可以一对多的进行消息传递(A->B/A->C/A->D)。

Delegate 无非就是把 A 的消息传递给代理对象 B，`self.delegate = self` 直接把代理对象设置为自己，这样省去了引入第三方代理，这种做法大部分情况是为了图个方便，一般出现在使用第三方闭源代码以及系统类（如：UITextField等）的情况下，因为我们无法获知内部消息是如何传递的，只能通过代理对象获知消息。

`self.delegate = self` 这种做法笔者并不推荐，因为它可能会带来一些安全隐患（特别是在依赖第三方库非常多的项目中），后文会做说明。

本文以系统类 **UITextField** 的子类为例展开讨论。

## 莫名奇妙的现象

在项目中我们经常会用到 UITextField 类或者其子类，有时候为了图其方便会把 UITextField 的 delegate 设置为自己（`self.delegate = self`），然而在使用 UITextField 控件时，发现程序不响应了，过了几秒后程序出现闪退现象。

既然 Bug 来了，那当然就是找 Bug，于是我们开始排查原因（先撇开调用栈信息）：

1. 首先针对新增的部分代码进行注释，把 `self.delegate = self` 代码注释掉，然后重新运行程序，发现问题得到解决。
2. 控制变量法开始排查。难道是 `self.delegate = self` 导致的？

于是新建工程，写了一份一模一样的代码（注：TXLimitedTextField 继承自 UITextField）：
    
```
    
@implementation ViewController
   
- (void)viewDidLoad {
  [super viewDidLoad];
  
  TXLimitedTextField *textField = [[TXLimitedTextField alloc] initWithFrame:CGRectMake(100, 100, 100, 30)];
  textField.backgroundColor = [UIColor redColor];
  textField.delegate = textField;
  [self.view addSubview:textField];
}
    
@end
    
```

运行新建的工程后，发现没有这问题。于是在 TXLimitedTextField.m 文件中再实现自己的代理方法：

```

@interface TXLimitedTextField ()

@end
    
@implementation TXLimitedTextField
    
- (BOOL)textFieldShouldReturn:(UITextField *)textField {
   [textField endEditing:YES];
   return YES;
}
    
@end

```

运行工程，使用 TXLimitedTextField 控件，发现还是没有这问题。

What‘s fuck?? 原项目代码有毒？？

进行全局断点后，重新再次运行项目，发现调用栈无限递归，直到栈溢出，最后导致程序崩溃。

下面我们来看是什么原因导致的。

## 什么问题？

`self.delegate = self`（self 指 TXLimitedTextField 实例）调用栈无限递归？于是，我们针对 TXLimitedTextField 类查找一下整个项目中有没有这种代码：

```

- (void)doSomething {
    if ([self.delegate respondsToSelector:@selector(doSomething)]) {
        [self.delegate performSelector:@selector(doSomething)];
    }
}

```

首先，这种写法一定要避免，尤其是在使用系统类或者第三方闭源框架时应特别注意，因为你并不知道其实现代码是如何写的。

如果整个项目中没有这种代码，检查一下是否存在 UITextField 运行时相关代码或者第三方框架，比如：BlocksKit等等。下面笔者举个具体的例子：

这段时间在维护一个旧项目，最近发现项目出现上述的问题，仔细排查后发现项目中用到了 BlocksKit，其中有一个 Category（UITextField + BlocksKit），其中针对 UITextField 的 delegate 进行动态调剂，把 delegate 替换成 A2DynamicUITextFieldDelegate（父类为 A2DynamicDelegate，根类为 NSProxy 类）的实例，NSProxy 类主要用于消息转发的（不熟悉的，请查阅[**官方文档**](https://developer.apple.com/reference/foundation/nsproxy)）。

断点至自定义的 UITextField 中的 -respondsToSelector: 方法以及 A2DynamicDelegate 中的如下方法：

```

- (NSMethodSignature *)methodSignatureForSelector:(SEL)aSelector {
	A2BlockInvocation *invocation = nil;
	.
	.
	.(略)
	else if (class_respondsToSelector(object_getClass(self), aSelector))
		return [object_getClass(self) methodSignatureForSelector:aSelector];
	return [[NSObject class] methodSignatureForSelector:aSelector];
}

- (void)forwardInvocation:(NSInvocation *)outerInv {
	SEL selector = outerInv.selector;
	A2BlockInvocation *innerInv = nil;
	.
	.
	.(略)
	} else if ([self.realDelegate respondsToSelector:selector]) {
		[outerInv invokeWithTarget:self.realDelegate];
	}
}

- (BOOL)respondsToSelector:(SEL)selector {
    NSLog(@"%s--%@", __func__, NSStringFromSelector(aSelector));
	return [self.invocationsBySelectors bk_objectForSelector:selector] || class_respondsToSelector(object_getClass(self), selector) || [self.realDelegate respondsToSelector:selector];
}

```

发现程序一直在这四个方法中循环执行，直到栈溢出，最终致使程序崩溃。相信大家遇到的问题都与此类似，下面笔者将以此例进行具体分析并究其原因。

## 什么原因？

找到了程序的崩溃点后，通过 NSLog 输出上述方法中的选择器 selector，发现是 -keyboardInputChangedSelection: 方法，于是设置条件断点（[NSStringFromSelector(aSelector) isEqualToString:@"keyboardInputChangedSelection:"]）如图所示：

![about-delegate-conditional-break](http://image.tingxins.cn/blog/images/2017/about-delegate-conditional-breakpoint.png)
    
进入断点调试后，发现一个有意思的事，如图所示：

![about-delegate-infinite-exe-point](http://image.tingxins.cn/blog/images/2017/about-delegate-infinite-exe-point.png)

这说明，在 UITextField 中，伪代码如下：

```

- (id)keyboardInputChangedSelection:(id)obj {
    // self == UITextField
    if ([self.delegate respondsToSelector:@selector(keyboardInputChangedSelection:)]) {
        [self.delegate keyboardInputChangedSelection:obj];
    }
    
}

```

看到这个方法后，读者应该发现 -keyboardInputChangedSelection: 方法与本节开头所提 -doSomething: 方法结构是一模一样的？只是方法名不同而已。

此时，细心的读者可能会产生一个疑惑，如果如上所述，那么上文提到新建的工程（TXLimitedTextField 类，如果写了 `self.delegate = self`）也应该会出现无限递归（死循环）才对啊？

![about-delegate-self-infinite](http://image.tingxins.cn/blog/images/2017/about-delegate-self-infinite.png)

然而事实上却没发生死循环。

笔者通过断点调试，发现 TXLimitedTextField 同样会调用 -keyboardInputChangedSelection:，断点截图同上，但不会出现死循环，最终导致程序崩溃的现象，笔者猜测分析，UITextField 类应该针对 `self.delegate = self` 做了一些特殊的处理，具体什么处理，就得问苹果爸爸了。可以肯定的是，在没有任何方法调剂的情况下，即 “self.delegate == self”，是不会出现死循环的问题的。

但是，此处存在方法调剂，即 BlocksKit 动态替换了 UITextField 类中 delegate（在其子类亦生效），因此 delegate 其实是 A2DynamicDelegate 实例，为了帮助读者理解，笔者简单画了一张图：

![about-delegate-message-forwarding](http://image.tingxins.cn/blog/images/2017/about-delegate-message-forwarding.png)

当点击 UITextField 控件时调用栈如下（省略部分）：

1. [UITextField respondsToSelector:] // return YES
2. [UITextField keyboardInputChangedSelection:]
3. [TXLimitedTextField.delegate respondsToSelector] // 由于self.realDelegate（realDelegate 是 A2DynamicDelegate 实例持有的弱引用对象，感兴趣的读者可以看看 BlocksKit 源码） 响应该方法，于是 return YES
4. [TXLimitedTextField.delegate keyboardInputChangedSelection:] // 实际上 A2DynamicDelegate 并未实现 keyboardInputChangedSelection: 方法，于是进入消息转发阶段
5. [TXLimitedTextField.delegate methodSignatureForSelector:]
6. [TXLimitedTextField.delegate forwardInvocation:] // 将消息再次转发给 self.realDelegate，于是开始死循环。

## 该如何解决？

通过上文主要以 UITextField 为例进行讨论分析，那么这种问题应当如何解决？

1. 在没有考虑清楚前，避免使用 `self.delegate = self`。
2. 破除死循环，解决上述问题，只需停止消息转发即可（不过会存在一些小问题），可以在 -forwardInvocation: 方法中处理。

至于在 BlocksKit 中具体怎么处理该问题，在笔者的一个开源项目中进行了实践，在使用 InputKit 过程中，即使 `self.delegate = self`，也不会出现上述死循环的问题，本文不做详述，详见[InputKit](https://github.com/tingxins/InputKit).

## 闲谈

笔者遇到上述的问题，其实属消息转发间接导致，可以说是第三方框架 BlocksKit 的一个 Bug，作者已经有一年多未更新该框架了哈（可能有由于 Swift 不再推荐使用 runtime 相关的方法，特别是消息转发相关 API，作者无力更新 Objective-C，哈哈）。


## 广告

欢迎关注微信公众号

![wechat-qrcode](http://image.tingxins.cn/adv/wechat-qrcode.jpg)



