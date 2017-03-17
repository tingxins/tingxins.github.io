---
layout: post
title: 02-希尔排序(Shell Sort)--(C语言)
date: 2017-03-17 00:21:00.000 +09:00
---


![By Simpsons contributor - Own work, CC0, https://commons.wikimedia.org/w/
index.php?curid=16020133](/assets/images/2017/sorting_shellsort_anim.gif)

## 前言

**希尔排序**算法其本质就是插入排序，是直接插入排序算法的一种改进，因 [D.L shell](https://en.wikipedia.org/wiki/Donald_Shell) 于 1959 年提出而得名，通常我们也称希尔排序为**缩小增量排序**，所谓`增量`，即将待排序的序列按该增量分割一个或多个子序列，所谓`缩小`，即当以某个增量分成的所有子序列都排序完后，增量会逐渐缩小（ps：最后一定会缩小到1）。如：先以3为增量，则将待排序的序列下标1、4、7···分成一组，将下标为2、5、8···分成另一组···，当以3为增量分割的所有子序列都排序好后（默认递增），再以1为增量分割该序列（ps：其实就是对基本有序的序列进行直接插入排序），最后完成整个希尔排序。

希尔排序算法依然可采用嵌套 for 循环的方式实现，本文将只采用递归的方法实现该算法。对于 for 循环的方式，感兴趣的童鞋可以参考笔者之前写的一篇文章[哥德巴赫猜想](https://tingxins.com/2017/03/goldbach-conjecture/)。下面我们开始进入正题。

## 分析

我们以下面10个数字组成的序列来做分析：

13, 12, 2, 22, 16, 11, 10, 1, 21, 15

首先我们要明白希尔排序算法的执行时间依赖于增量序列，关于增量序列，要注意两点：

1. 增量序列最后一个增量必须为1.
2. 应尽量避免增量序列中的值互为倍数（避免重复排序），如：1、2、4、8。

针对上面给出的序列，我们以5、3、1为增量序列，下面模拟排序，以增量5为例，下面是每个子序列完成排序后的结果：

* 13 12 2 22 16 11 10 1 21 15

* **`11`** 12 2 22 16 **`13`** 10 1 21 15 //11 与 13 互换
* 11 **`10`** 2 22 16 13 **`12`** 1 21 15 //10 与 12 互换
* 11 10 **`1`** 22 16 13 12 **`2`** 21 15 //1 与 2 互换
* 11 10 1 **`21`** 16 13 12 2 **`22`** 15 //21 与 22 互换
* 11 10 1 21 **`15`** 13 12 2 22 **`16`** //15 与 16 互换

此时以5为增量分割的五个子序列都已排序完成：

* 11 10 1 21 15 13 12 2 22 16

然后在对上面得出的结果以增量3进行分割，重复相同的操作，最后在以1为增量进行分割（即进行一趟直接插入排序），从而完成希尔排序。


## 思路

采用递归方式，上文也提到过，希尔排序本质就是一种插入排序，是直接插入排序的一种改进。通过上述分析，我们可以划分如下几个步骤：

1. 递归增量序列。
2. 递归增量分割的所有子序列。
3. 针对子序列进行直接插入排序（递归方式）。
4. 返回步骤1，知道增量序列递归完毕。

针对这几个步骤，我们来把握以下临界值：

1. 只有当前增量 delta > 1 时，我们才需要继续递归增量序列，反之，代表希尔排序已经完成。
2. 

## 实现

通过上述分析，想必大部分读者已经有思路，现在我们上代码。程序主要分四个模块：

1. 专门处理特定子序列排序递归函数（采用直接插入排序）

    ```
    
    /**
    针对特定子序列进行直接插入排序，比较每一趟排序的数字并排排序
 
    @param data 待排序的序列
    @param tmp 寻找插入位置的当前元素
    @param n 序列长度
    @param delta 本趟排序增量
    */
    int StraightInsertionSortInnerRecursionCompare(int data[], int tmp, int n,  int delta) {
        if (n < 0) return n + delta; // 直接返回当前比较待插入的位置
        if (tmp < data[n]) {
           data[n + delta] = data[n]; // 把大的元素往后挪
        }else {
            return n + delta; // 返回当前比较待插入的位置
        }
        return StraightInsertionSortInnerRecursionCompare(data, tmp, n - delta, delta);// 子序列递归方式排序
}
    // 得出索引值
    int StraightInsertionSortInnerRecursionIndex(int data[], int n, int delta) {
        return StraightInsertionSortInnerRecursionCompare(data, data[n], n - delta, delta);
}
    
    ```

2. 处理所有子序列排序的递归函数

    ```
    
    // 递归增量分割的所有子序列，针对排序递归！
void StraightInsertionSortInnerRecursion(int data[], int n, int currentIndex, int delta)  {
    if (currentIndex >= n) return;
    int tmp =  data[currentIndex];
    data[StraightInsertionSortInnerRecursionIndex(data, currentIndex, delta)] = tmp; // 根据返回的索引修改该值，表示一趟排序完成
    StraightInsertionSortInnerRecursion(data, n, currentIndex + delta, delta);
}
    
    ```
    
3. 处理增量序列的递归函数

    ```
    
    /**
    递归增量序列，希尔排序，注意delta 为素数，
 
    @param data 待排序的序列
    @param n 序列长度
    @param currentIndex 子序列排序起点
    @param delta 本趟排序增量
    */
    void shellSort(int data[], int n, int currentIndex, int delta) {
        if (delta % 2 == 0) {
            printf("Delta error!");
            return;
        }
        if (delta < 1) return;
    
        if (currentIndex + delta > n) {
            shellSort(data, n, 0, delta - 2);
        }else {
            StraightInsertionSortInnerRecursion(data, n, currentIndex + delta, delta);
            if (delta > 1) {
                shellSort(data, n, currentIndex + 1, delta);//开始递归下一个子序列
            }
        }
    }
    
    ```
    
4. 主函数模块

    ```
    int main() {
        int data[] = {13, 12, 2, 22, 16, 11, 10, 1, 21, 15};//为了方便，先固定该序列
        int n = 10;
        shellSort(data, n, 0, 5); // 开始希尔排序
        return 0;
    }
    
    ```
    
### 时间复杂度

希尔排序的复杂度分析较为复杂，笔者高数较水，此处不做分析，感兴趣的同学可以参考：[传送门](https://en.wikipedia.org/wiki/Shellsort#Gap_sequences)。[源码地址](https://github.com/tingxins/tx-c-algorithm/tree/master/Classical%20Algorithm/GoldbachConjecture)


