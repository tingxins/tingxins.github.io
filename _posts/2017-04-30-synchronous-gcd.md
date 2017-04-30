---
layout: post
title: iOS 中网络请求同步
date: 2017-04-30 09:00:00 +09:00
---

## 场景

在开发过程中，有时候会遇到这样一些问题，比如：

* 在某些业务要求下，需发送同步请求。
* 在某些界面需请求多个接口，且各个接口返回的数据之间或者整体存在依赖关系。
* ···

那么在上述的这些场景下应如何发送网络请求？发同步请求 or 异步请求？请求嵌套？······

本文将简单探究开发过程中**网络请求同步**的问题以及相关注意点。

## NSURLConnection 中的同步请求

我们都知道 NSURLConnection 中有一个同步请求的 API :

```

+ (NSData *)sendSynchronousRequest:(NSURLRequest *)request
returningResponse:(NSURLResponse **)response
error:(NSError **)error

```

针对上述的第一种情况 A，该 API 可满足要求。如果同步请求阻塞主线程的时间过长，存在被 watchdog kill 的可能。想避免这种情况，建议在子线程中调用此 API。(感兴趣的同学可以看看，关于 [watchdog timeout crashes](https://developer.apple.com/library/content/qa/qa1693/_index.html)/[Understanding and Analyzing Application Crash Reports](https://developer.apple.com/library/content/technotes/tn2151/_index.html))

同步请求相对异步请求而言存在一些缺陷，如：

1. 请求发出后，就无法取消
2. 返回的数据只能放到请求结束后进行处理
3. ···

很遗憾，NSURLConnection 目前已被苹果全面弃用，并且 AFNetworking 在 3.x 中已经移除此类 API，因此同步请求不建议采用此种方式。

## Dispatch_semaphore（信号量）

**信号量机制**，我们可以简单理解为资源管理分配的一种抽象方式。在 GCD 中，提供了以下这么几个函数，可用于请求同步等处理，模拟同步请求：

1. dispatch_semaphore_t semaphore = dispatch_semaphore_create(value);
2. dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
3. dispatch_semaphore_signal(semaphore);

value 可以理解为资源数量，以 value = 0 为例，调用 dispatch_semaphore_wait 操作成功后，当资源数量 value 等于 0 时，就会阻塞当前线程（反之，value 就会减 1），直到有 dispatch_semaphore_signal 通知信号发出，当 value 大于 0 时，当前线程就会被唤醒继续执行其他操作。

下面我们展示一段代码来模拟同步请求：

**Objective-C**:

```
    // 1.创建信号量
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
    NSLog(@"0");
    // 开始异步请求操作（部分代码略）
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSLog(@"1");
        // This function returns non-zero if a thread is woken. Otherwise, zero is returned.
        // 2.在网络请求结束后发送通知信号
        dispatch_semaphore_signal(semaphore);
    });
    // Returns zero on success, or non-zero if the timeout occurred.
    // 3.发送等待信号
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    NSLog(@"2");

    // print 0、1、2
    
```

**Swift**:

```
    func sendSynchronousDataTask(with url: URL) -> (Data?, URLResponse?, Error?) {
        var data: Data?
        var response: URLResponse?
        var error: Error?
        // 1.创建信号量
        let semaphore = DispatchSemaphore(value: 0)
        // 开始异步请求操作
        let dataTask = URLSession.shared.dataTask(with: url) {
            data = $0
            response = $1
            error = $2
            // 2.在网络请求结束后发送通知信号
            semaphore.signal()
        }
        dataTask.resume()
        // 3.发送等待信号
        _ = semaphore.wait(timeout: .distantFuture)
        
        return (data, response, error)
    }

```

在 iOS 系统中，如果应用不能及时的响应用户界面交互事件（如启动、暂停、恢复和终止），watchdog 就会杀死程序并生成一个 watchdog 超时崩溃报告，据官方说法，watchdog timeout 时间并没有明文规定，但一般会少于网络请求超时时间。

> In order to keep the user interface responsive, iOS includes a watchdog mechanism. If your application fails to respond to certain user interface events (launch, suspend, resume, terminate) in time, the watchdog will kill your application and generate a watchdog timeout crash report. The amount of time the watchdog gives you is not formally documented, but it's always less than a network timeout.

这里有一个奇怪的现象，经测试，笔者采用信号量机制一直阻塞主线程时并没有被 **watchdog** kill，但 **NSURLConnection** 中的同步请求方法 + sendSynchronousRequest:returningResponse:error: 在慢速网络下与其说 crash 了，不如说被 watchdog kill 了。不扯远了，开始下一个话题 —— dispatch_group_t

## Dispatch_group（组）

继续本文话题，回顾文章开头提到的问题，如果针对单个请求进行同步处理，那么使用同步请求即可，上述两种方式都可以。如果在某些界面需请求多个接口，且各个接口返回的数据之间或者整体存在依赖关系，那怎么办呢？虽然采用嵌套请求的方式能解决此问题，但存在很多问题，如：其中一个请求失败会导致后续请求无法正常进行、多个请求在时间上没有复用，即无并发性。

> A dispatch group is a mechanism for monitoring a set of blocks. Your application can monitor the blocks in the group synchronously or asynchronously depending on your needs. By extension, a group can be useful for synchronizing for code that depends on the completion of other tasks.

针对这种情形，即某个操作依赖于其他几个任务的完成时，我们可采用 dispatch_group。主要使用如下两个函数：

1. dispatch_group_enter(group);
2. dispatch_group_leave(group);

以上这两个函数必须配对使用，否则 dispatch_group_notify 不会触发。贴一段代码 + 一张效果图（[源码](https://github.com/tingxins/TXBrowser)）：

```
    // 创建 dispatch 组
    dispatch_group_t group = dispatch_group_create();
    
    // 第一个请求：
    dispatch_group_enter(group);
    [self sendGetAddressByPinWithURLs:REQUEST(@"getAddressByPin.json") completionHandler:^(NSDictionary * _Nullable data, NSError * _Nullable error) {
        NSArray *addressList = [TXAddressModel mj_objectArrayWithKeyValuesArray:data[@"addressList"]];
        self.addressList = addressList;
        dispatch_group_leave(group);
    }];
    
    // 第二个请求
    dispatch_group_enter(group);
    [self sendCurrentOrderWithURLs:REQUEST(@"currentOrder.json") completionHandler:^(NSDictionary * _Nullable data, NSError * _Nullable error) {
        TXCurrentOrderModel *currentOrderModel = [TXCurrentOrderModel mj_objectWithKeyValues:data];
        self.currentOrderModel = currentOrderModel;
        dispatch_group_leave(group);
    }];
    
    // 当上面两个请求都结束后，回调此 Block
    dispatch_group_notify(group, dispatch_get_main_queue(), ^{
        NSLog(@"OVER:%@", [NSThread currentThread]);
        [self setupOrderDataSource];
    });

```

![browser-jd](http://image.tingxins.cn/Blog/browser-jd.png)

对于熟悉 dispatch_group 的同学来说，可能会想，为何不用 dispatch_group_async？对于网络请求而言，请求发出时它就已经执行完毕，也就是 block 中还有个 completeHandler 的情况下，dispatch_group_async 并不会等待网络请求的回调，所以不符合我们要求。

## 总结

通过本文简单探究，展示了如何采用信号量机制模拟同步请求，在开发过程中，我们应尽量避免发送同步请求；并且在某个操作依赖于其他几个任务的完成时，采用 **dispatch_group_async** or **dispatch_group_enter/dispatch_group_leave** 来实现同步等处理。如果是进行网络请求同步，应采用后者。当然，如果感兴趣，我们可以在第三方网络库的基础上封装一层自己网络库。（[相关源码](https://github.com/tingxins/TXBrowser)）






