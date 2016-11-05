---
layout: post
title: 性能优化之NSDateFormatter
date: 2016-10-27 15:32:24.000 +09:00
---
-   [为什么要优化NSDateFormatter？](#nsdateformatter)
-   [优化方式有哪些？](#优化方式有哪些)

### 为什么要优化NSDateFormatter？

首先，过度的创建`NSDateFormatter`用于`NSDate`与`NSString`之间转换，会导致App卡顿，打开Profile工具查一下性能，你会发现这种操作占CPU比例是非常高的。据官方说法，创建`NSDateFormatter`代价是比较高的，如果你使用的非常频繁，那么建议你缓存起来，缓存`NSDateFormatter`一定能提高效率。

>Creating a date formatter is not a cheap operation. If you are likely to use a formatter frequently, it is typically more efficient to cache a single instance than to create and dispose of multiple instances. One approach is to use a static variable

### 优化方式有哪些？

#### a.延迟转换

即只有在`UI`需要使用转换结果时在进行转换。

#### b.Cache in Memory

根据`NSDateFormatter`线程安全性，不同的iOS系统版本内存缓存如下：

*  prior to iOS 7  
 
如果直接采用静态变量进行存储，那么可能就会存在线程安全问题，在iOS 7之前，`NSDateFormatter`是非线程安全的，因此可能就会有两条或以上的线程同时访问同一个日期格式化对象，从而导致App崩溃。

```Objective-C
+ (NSDateFormatter *)cachedDateFormatter {
    NSMutableDictionary *threadDictionary = [[NSThread currentThread] threadDictionary];
    NSDateFormatter *dateFormatter = [threadDictionary objectForKey:@"cachedDateFormatter"];
    if (!dateFormatter) {
        dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setLocale:[NSLocale currentLocale]];
        [dateFormatter setDateFormat: @"YYYY-MM-dd HH:mm:ss"];
        [threadDictionary setObject:dateFormatter forKey:@"cachedDateFormatter"];
    }
    return dateFormatter;
}
```

* iOS 7 or later  
  
在iOS 7、macOS 10.9及以上系统版本，`NSDateFormatter`都是`线程安全`的，因此我们无需担心日期格式化对象在使用过程中被另外一条线程给修改，为了提高性能，我们还可以在上述代码块中进行简化（除去冗余部分）。

```Objective-C
static NSDateFormatter *cachedDateFormatter = nil;
 
+ (NSDateFormatter *)cachedDateFormatter {
    NSMutableDictionary 
    // If the date formatters aren't already set up, create them and cache them for reuse.
    if (!dateFormatter) {
        dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setLocale:[NSLocale currentLocale]];
        [dateFormatter setDateFormat: @"YYYY-MM-dd HH:mm:ss"];
    }
    return dateFormatter;
}   
```

如果缓存了日期格式化或者是其他依赖于`current locale`的对象，那么我们应该监听`NSCurrentLocaleDidChangeNotification`通知，当`current locale`变化时及时更新被缓存的日期格式化对象。

>In theory you could use an auto-updating locale (autoupdatingCurrentLocale) to create a locale that automatically accounts for changes in the user’s locale settings. In practice this currently does not work with date formatters.

[Apple Threading Programming Guide][id2]

#### c.利用标准C语言库

如果时间日期格式是固定的，我们可以采用C语言中的strptime函数，这样更加简单高效。

```C
- (NSDate *) easyDateFormatter{
    time_t t;
    struct tm tm;
    char *iso8601 = "2016-09-18";
    strptime(iso8601, "%Y-%m-%d", &tm);
    tm.tm_isdst = -1;
    tm.tm_hour = 0;//当tm结构体中的tm.tm_hour为负数，会导致mktime(&tm)计算错误
    /**
     //NSString *iso8601String = @"2016-09-18T17:30:08+08:00";
     //%Y-%m-%d [iso8601String cStringUsingEncoding:NSUTF8StringEncoding]
     {
         tm_sec = 0
         tm_min = 0
         tm_hour = 0
         tm_mday = 18
         tm_mon = 9
         tm_year = 116
         tm_wday = 2
         tm_yday = 291
         tm_isdst = 0
         tm_gmtoff = 28800
         tm_zone = 0x00007fd9b600c31c "CST"
     }
     ISO8601时间格式：2004-05-03T17:30:08+08:00 参考Wikipedia
     */
    t = mktime(&tm);
    //http://pubs.opengroup.org/onlinepubs/9699919799/functions/mktime.html
    //secondsFromGMT: The current difference in seconds between the receiver and Greenwich Mean Time.
    return [NSDate dateWithTimeIntervalSince1970:t + [[NSTimeZone localTimeZone] secondsFromGMT]];
}
```

相关资料：

[Date Formate Patterns][id1] :
![Date Formate Patterns][1]

[Standard C library][id3]

[ISO_8601][id4]

[id1]:http://www.unicode.org/reports/tr35/tr35-25.html#Date_Format_Patterns
[id2]:https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/Multithreading/ThreadSafetySummary/ThreadSafetySummary.html
[id3]:http://www.gnu.org/software/libc/
[id4]:https://en.wikipedia.org/wiki/ISO_8601

[1]:/assets/images/2016/date-formate-patterns.jpg


