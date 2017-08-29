---
layout: post
title: iOS 主题/皮肤之 SakuraKit
date: 2017-08-27 23:30:00.000 +09:00
---

![sakura-kit-logo](http://image.tingxins.cn/sakura/sakura-kit-logo.png)

## 前言

目前市场上很多 App 都有主题变更、皮肤切换的功能。随着项目代码量的不断增长，业务不断完善，功能性代码逐渐趋于模块化，尤其是在多人协作开发同一个项目时，模块解耦尤为重要，同时，公共基础库的功能性代码使用越简单越好。

前段时间在维护旧项目时，收到 App 主题变更、皮肤切换的需求，其包括 App 中各种图标、色值、文字、字体等都包括在内，都需实现主题化。主要用于：

1. **活动主题展示**：比较典型的是类似京东618、天猫淘宝购物节主题变更。
2. **用户夜间模式**：类似阅读相关 App 的夜间模式，如：简书等。
3. **用户主题变更**：用户可通过本地或者远程下载喜欢的主题，如：网易云音乐、QQ 音乐等 App 主题变更。

由于老项目代码比较混乱，功能模块耦合严重以及开发时间等综合因素，在实现 App 主题变更、皮肤切换的功能的同时，想要在尽量不修改旧代码的基础上增加新的功能是比较麻烦的。

由于没有合适的第三方库，于是自己手撸了一个库 [SakuraKit](https://github.com/tingxins/SakuraKit)，并开源，希望能帮到需要的朋友。

下面我们开始介绍 [SakuraKit](https://github.com/tingxins/SakuraKit) 及快速入门。

## SakuraKit

[SakuraKit](https://github.com/tingxins/SakuraKit)，是一个轻量级的、专门用于 App 主题变更、皮肤切换的开源库（灵感源自 SwiftTheme、DKNightVersion等），采用函数式 + 链式的编码方式，简单实用、方便理解、利于维护。

## 快速入门

### 效果

在体验前，我们先来看看效果图：

![sakura-kit-demo](http://image.tingxins.cn/sakura/sakura-kit-demo.gif)

### 体验

下面以 `UIButton` 为例，介绍如何使用 [SakuraKit](https://github.com/tingxins/SakuraKit) 进行主题化：

```

UIButton *button = [[UIButton alloc] initWithFrame:CGRectMake(100, 100, 100, 100)];
    
button.sakura
.backgroundColor(@"Home.buttonBackgroundColor")
.titleColor(@"Home.buttonTitleColor", UIControlStateNormal);

```

上述代码是给一个 button 的背景色（`backgroundColor`）以及标题颜色（`titleColor`）进行主题化。其中 `Home.buttonBackgroundColor` 与 `Home.buttonTitleColor` 属配置文件中的 `KeyPath`，配置文件的功能有点类似语言本地化文件（Localizable.strings）。后文会重点介绍如何设置配置文件。

到此为止，我们已经实现了 button 按钮主题化功能，如果你想切换主题，可以调用如下 API：

```

+ (BOOL)shiftSakuraWithName:(TXSakuraName *)name type:(TXSakuraType)type;

```

其中 `name` 参数代表主题的名称，`type` 参数代表主题类型（目前有两种：**沙盒**和**本地**）。
 
现在我们再具体的介绍一下如何使用 [SakuraKit](https://github.com/tingxins/SakuraKit)。

### 配置文件

做过 App 语言本地化的童鞋，应该比较熟悉 Localizable.strings 文件配置，同理，我们在使用 [SakuraKit](https://github.com/tingxins/SakuraKit) 对 App 进行主题化时，也需要进行类似的配置。目前支持 **.json** 和 **.plist** 两种文件格式。

下面我们以 .json 文件格式做示例：

```
{
	"Home":{
            "buttonBackgroundColor":"#BB503D",
            "buttonTitleColor":"#4AF2A1"
        }
}

```

在上述体验代码中，我们看到这样的字符串：`Home.buttonBackgroundColor` 和 `Home.buttonTitleColor`，这其实就是配置文件中字典的 KeyPath，通过 `KeyPath` 可以取得不同主题下的值，如：色值、图片名称、文字、字体大小等等。

**注意事项：**

1. 每个主题都有自己配置文件，包括本地和沙盒主题。（本地主题名叫 **default**）。
2. 主题名称与配置文件名称一致，如：某个主题名叫 **fish**，那么该主题相应的配置文件就应命名为**fish.json**。（**建议遵守该约定**）
3. 不同本地主题的切图命名要做**区分**，不同远程主题的切图命名应**一致**。

### 本地主题

本地主题，即用户无需下载的主题，在 App Bundle 中。除了 App 本身自带的默认主题外，[SakuraKit](https://github.com/tingxins/SakuraKit) 还能够为 App 新增多种本地主题。

配置步骤如下：

#### 步骤一

新建 .json 配置文件，比如新建一个名叫 typewriter 的主题，因此配置文件命名为 typewriter.json。

#### 步骤二

配置一套切图，并且命名与已有的主题要做区分。

#### 步骤三

完成上述步骤后，在 AppDelegate 中 -application:application didFinishLaunchingWithOptions:launchOptions API 注册所有本地主题：

```

// 注意：本地默认主题无需注册
[TXSakuraManager registerLocalSakuraWithNames:@[@"typewriter"]];

```

#### 步骤四

调用切换主题 API 即可切换至该指定主题：

```

[TXSakuraManager shiftSakuraWithName:@"typewriter" type:TXSakuraTypeMainBundle];
    
```

### 远程主题

远程主题（资源压缩包.zip），即用户通过网络下载的主题，后台可动态配置。同本地主题一致，分为两部分：**配置文件** + **切图**。当配置文件和切图都弄好后，将文件夹打包成zip文件，传给后台即可。主题数据格式如下（仅供参考）：

```

{
    "name": "嘻多猴",
    "sakuraName": "monkey",
    "url": "http:\\image.tingxins.cn\sakura\monkey.zip"
}

```

sakuraName 是切换主题时用的名称，而 url 是该主题的下载地址。（**注：如果 sakuraName 字段传空，那么主题的名称将默认为下载的压缩包名称**）

当远程主题下载完毕后，可以这样切换主题：

```

[TXSakuraManager shiftSakuraWithName:sakuraName type:TXSakuraTypeSandBox];

```

值得一提的是，[SakuraKit](https://github.com/tingxins/SakuraKit) 提供了一些主题下载的简单接口，支持多种主题同时下载等操作，并且支持 Block 和 Delegate 两种方式的回调，同时用户还可自定义下载操作。

下面我们来依次介绍一下主题下载。

#### Block 方式

我们直接来介绍 API ：

```

[[TXSakuraManager manager] tx_sakuraDownloadWithInfos:sakuraModel downloadProgressHandler:^(int64_t bytesWritten, int64_t totalBytesWritten, int64_t totalBytesExpectedToWrite) {
    // 下载进度回调
} downloadErrorHandler:^(NSError * _Nullable error) {
    // 下载过程出现错误回调
} unzipProgressHandler:^(unsigned long long loaded, unsigned long long total) {
    // 主题下载完成后，解压进度回调
} completedHandler:^(id<TXSakuraDownloadProtocol> _Nullable infos, NSURL * _Nullable location) {
    // 主题包解压完毕回调
} ];


```

其中 `sakuraModel` 模型数据遵守了 `TXSakuraDownloadProtocol` 协议，具体使用详见 [SakuraDemo_OC](https://github.com/tingxins/SakuraKit)，在 `DownloadSakuraController` 控制器演示了该操作。

#### Delegate 方式

##### 步骤一

直接调用 API 实现主题下载：

```

[[TXSakuraManager manager] tx_sakuraDownloadWithInfos:sakuraModel delegate:self];


```

##### 步骤二

如果针对步骤一的下载操作需要回调，那么可以选择性的再实现以下方法：

```

// 重复点击下载某一主题，如果该主题已经处于下载中或者本地存在时将会回调，其中 status 标识该 downloadTask 状态。
- (void)sakuraManagerDownload:(TXSakuraManager *)manager
                 downloadTask:(NSURLSessionDownloadTask *)downloadTask
                       status:(TXSakuraDownloadTaskStatus)status;

// 主题下载完毕时回调，其中 infos 包括主题名称，可通过该参数直接切换至该主题
- (void)sakuraManagerDownload:(TXSakuraManager *)manager
                 downloadTask:(NSURLSessionDownloadTask *)downloadTask
                  sakuraInfos:(id<TXSakuraDownloadProtocol>)infos
    didFinishDownloadingToURL:(NSURL *)location;

// 主题下载进度
- (void)sakuraManagerDownload:(TXSakuraManager *)manager
                downloadTask:(NSURLSessionDownloadTask *)downloadTask
                didWriteData:(int64_t)bytesWritten
           totalBytesWritten:(int64_t)totalBytesWritten
   totalBytesExpectedToWrite:(int64_t)totalBytesExpectedToWrite;

/** Reserved for future use */
- (void)sakuraManagerDownload:(TXSakuraManager *)manager
                downloadTask:(NSURLSessionDownloadTask *)downloadTask
           didResumeAtOffset:(int64_t)fileOffset
          expectedTotalBytes:(int64_t)expectedTotalBytes;

// 下载操作出现错误时回调
- (void)sakuraManagerDownload:(TXSakuraManager *)manager
                 sessionTask:(NSURLSessionTask *)downloadTask
        didCompleteWithError:(nullable NSError *)error;

// 主题下载包解压进度回调
- (void)sakuraManagerDownload:(TXSakuraManager *)manager
                 downloadTask:(NSURLSessionDownloadTask *)downloadTask
                progressEvent:(unsigned long long)loaded
                        total:(unsigned long long)total;

```

具体使用详见 [SakuraDemo_OC](https://github.com/tingxins/SakuraKit)，在 `AppDelegate` 中演示了该操作。

#### 自定义下载操作

除了上述自带的下载操作外，SakuraKit 还提供了自定义下载操作相关的 API ：

```

// sakuraModel 模型数据遵守了 TXSakuraDownloadProtocol 协议，location 即自定义下载下来的主题包地址。
[[TXSakuraManager manager] tx_generatePathWithInfos:sakuraModel downloadFileLocalURL:location successHandler:^(NSString *toFilePath, NSString *sakuraPath, TXSakuraName *sakuraName) {
                  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{

      BOOL isSuccess = [SSZipArchive unzipFileAtPath:toFilePath toDestination:sakuraPath delegate:self];

      // 注意：自定义下载操作，必须进行 Sakura 路径格式化！Required！
      [TXSakuraManager formatSakuraPath:sakuraPath cleanCachePath:toFilePath];
      
      dispatch_sync(dispatch_get_main_queue(), ^{
          if (isSuccess) {
              [TXSakuraManager shiftSakuraWithName:sakuraName type:TXSakuraTypeSandBox];
          }
      });
   });
} errorHandler:^(NSError * _Nullable error) {
   NSLog(@"errorDescription:%@",error);
}];

```

## FQA

**1.为何每个主题都有自己配置文件？**

**答：** 由于每个主题，除了切图的命名是是一致的外，不同的主题背景色、字体大小可能不一样，因此，每个主题都要有自己的配置文件，除非只对切图进行本地化。

**2.为何主题名称与配置文件名称一致？**

**答：** 这只是一个约定，[SakuraKit](https://github.com/tingxins/SakuraKit) 会通过主题名称找到该主题在本地或者在沙盒中的路径，使得主题名称与配置文件名称一致，可以减少不必要的工作量。

**3.本地与沙盒主题有什么区别？**

**答：** 在本地主题称为 mainBundle 主题，远程主题称为 Sandbox 主题。

## 开源

关于 [SakuraKit](https://github.com/tingxins/SakuraKit) 具体使用，详见 Demo。

GitHub 项目地址：https://github.com/tingxins/SakuraKit

有什么问题或者更好的建议，GitHub 上直接提 issue 或者 PR。感谢支持

> Demo 素材来源：网易云音乐等第三方 App，如有不妥之处，请及时联系并予以删除，谢谢。

## 广告

欢迎关注微信公众号

![wechat-qrcode](http://image.tingxins.cn/adv/wechat-qrcode.jpg)

