---
layout: post
title: 关于 Objective-C 中的对象、类、元类
date: 2017-05-31 00:22:00.000 +09:00
---

![instance-class-meta_class-bg](http://image.tingxins.cn/blog/images/2017/instance-class-meta_class-bg.png)

## 前言

现在写文章拖延症特别严重啊 (😂)......

本文我们将复习一下 Objective-C 中的一些关于类的知识。

在开发过程中，类与对象相信大家再熟悉不过了，有时我们也会接触一个比较陌生的概念，元类（metaclass），甚至在回头来想时，发现类与对象是什么都开始犯糊涂了，本文主要探讨这三者之间的关系以及在消息转发中各自扮演的角色，希望读者看完本文能有所收获。如有不妥的地方还望大家及时帮忙纠正。

## 什么是类？

在面向对象编程语言中，**类**是一个非常重要的概念，理解了它，能更好的造轮子、能更好的面向对象编程、能写出模块化的代码、更能提高代码的可读性及后期维护性。

`类`是数据及行为的封装体，在 Objective-C 中，在数据上，`类`定义了内存分配大小、内存布局以及成员变量数据类型等，在行为上，`类`定义了实例方法等。我们可以简单的把`类`比作为某个产品的设计稿。

通过查阅 Apple 官方开源的 objc 源码（官方最新版—>[传送门](https://opensource.apple.com/source/objc4/objc4-709/)），得知类的数据结构（其中字段本文不做解释，可自行 Google），如下：

```

typedef struct objc_class *Class;

struct objc_class : objc_object {
    // Class ISA;
    Class superclass;
    // formerly cache pointer and vtable
    cache_t cache;  
    // class_rw_t * plus custom rr/alloc flags              
    class_data_bits_t bits;    

    class_rw_t *data() { 
        return bits.data();
    }
    .
    .
    .
    ...(省略)
}
    
```

看完这小段代码，细心的同学会发现，objc_class 继承自 objc_object，没错，类其实也是一个对象，既然类是一个对象，那么它一定是某个类的实例。先不讨论此问题，我们先来谈谈对象。

## 什么是对象？

**对象**一定是某个`类`具体的一个实例，可以简单理解为`类`的“值”，可直接使用，就像洗衣机（`对象`）一样可以直接用来洗衣服（`数据`），但洗衣机的设计稿（`类`）却不能。对象具有动态性，它有自己的生命周期，对象在生命周期结束时会调用 dealloc 方法。

在 Objective-C 中，含有一个 isa 指针并且可以正确指向某个类的数据结构，都可以视作为一个对象，其中 isa 指针指向当前对象所属的类。通过查阅 Apple 官方开源的 objc 源码（官方最新版—>[传送门](https://opensource.apple.com/source/objc4/objc4-709/)），得知类的数据结构（其中字段本文不做解释，可自行 Google），如下：

```

struct objc_object {
private:
    isa_t isa;
    .
    .
    .
    ...(省略)
}

```

每当要向某个对象发送一个消息时，都会通过 isa 指针找到该对象所属的类（因为类定义了对象的**行为**），然后再遍历其方法缓存表或者方法列表（行为），通过 SEL 找到后取出方法（Method）中的 IMP 函数入口指针，并执行该函数，如果找不到该方法，则进入消息转发等等，此处本文不做概述。

讨论完对象之后，我们再来回顾上文遗留的一个问题：类既然是一个对象，那么这个对象的类是什么呢？
接下来我们将讨论此问题。

## 什么是元类？

**元类**是类对象的类。简单的说类描述的是对象，那么元类描述的就是类。同理，元类定义了类的行为（类方法），每当要向某个类发送一个消息时，都会通过 isa 指针找到该类所属的元类，然后遍历其方法缓存表或者方法列表，通过 SEL 找到后取出方法中的 IMP 函数入口指针，并执行该方法，否则进行消息转发阶段等等。

说到元类，那么定会有人问，元类的类是什么？元类也是一个对象，元类的类是根元类，根元类在继承体系中是根类的元类，那么根类的元类是属于哪个类呢？根元类的类就是自己（即 isa 指针指向自己），根元类的父类 superClass 指针指向 根类。

## 对象、类与元类的关系

Greg Parker (@[gparker](https://twitter.com/gparker)) 给出了一张图，使得整个结构清晰明了：

![instance-class-meta_class](http://image.tingxins.cn/blog/images/2017/instance-class-meta_class.png)


## 理解与探究

### 理解

如果上述都理解了，那么下面这段代码看懂就没问题了。 -(IMP)methodForSelector:(SEL)aSelector 是 NSObject 类的一个实例方法，以下两种调用方式都是正确的：
 
- [NSObject methodForSelector:@selector(test)];
- [[[NSObject alloc] init] methodForSelector:@selector(test)];

### 探究

为了验证本文的一些说法，下面我们写个测试代码进行验证，输出结果本文不做分析，有兴趣的读者可以对照上文自行分析：

```

Class currentClass = [UITextField class];
for (int index = 0; index < 5; ++ index) {
   
   NSLog(@"## index:%d ## isa:%p --- superClass:%p", index, currentClass, class_getSuperclass(currentClass));
   currentClass = object_getClass(currentClass);
}
NSLog(@"NSObject:%p --- NSObject Meta Class:%p\nMeta super Class:%p --- Meta root Class:%p", [NSObject class], object_getClass([NSObject class]), class_getSuperclass(object_getClass([NSObject class])), object_getClass(object_getClass([NSObject class])));

```

运行上述代码后，输出结果如下：

![instance-class-meta_class-loginfos](http://image.tingxins.cn/blog/images/2017/instance-class-meta_class-loginfos.png)

### By the way, happy Children's Day!🤡🤡🤡

#### 参考链接

1. [What is a meta-class in Objective-C?](http://www.cocoawithlove.com/2010/01/what-is-meta-class-in-objective-c.html)

2. [Classes and metaclasses](http://www.sealiesoftware.com/blog/archive/2009/04/14/objc_explain_Classes_and_metaclasses.html)



