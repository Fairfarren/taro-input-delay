# 项目依赖

```
"@tarojs/taro": "3.6.25",
"react": "^18.0.0",
```

# 问题

问题描述：
input框在输入时，内容不跟手，内容闪烁的问题，在查找issues后发现此问题并没有得到官方的解决，于是开始寻找规避此问题的方案

[问题issue](https://github.com/NervJS/taro/issues/13979)

复现：
- 因为出现问题的手机为iphone7，我目前只有iphone12，所以这里demo采用渲染500个input框的方式来加大压力


```tsx
export default function Index() {
    const [list, setList] = useState<number[]>(() => {
        const arr = []
        for (let i = 0; i < 500; i++)
            arr.push(i)

        return arr
    })

    function setValue(value, index) {
        setList((e) => {
            e.splice(index, 1, value)
            return [...e]
        })
    }

    return (
        <View className={Style.index}>
            {
                list.map((item, index) => (
                    <View className="diyInput">
                        <Input
                            className="input"
                            value={String(item)}
                            onInput={e => setValue(e.detail.value, index)}
                        />
                    </View>
                ),
                )
            }
        </View>
    )
}
```

[问题演示视频](https://remember-quick.oss-cn-chengdu.aliyuncs.com/app/81e757e3fdbbc0d247afd5071328c80f.mp4)


# 排查

第一个想到的点是，taro3打包后的小程序代码是通过`<template>`渲染的，所有的 `setData` 都由页面对象调用。如果页面结构比较复杂，应用更新的性能就会下降。再加上react的更新模式是全量更新

首先想到的方案是使用`CustomWrapper`组件嵌套input，将input独立出来，并且使用`memo`缓存此组件，避免不必要的渲染

# 使用`CustomWrapper`和`memo`

于是有了以下代码

```tsx
// index.tsx

export default function Index() {
    const [list, setList] = useState<number[]>(() => {
        const arr = []
        for (let i = 0; i < 500; i++)
            arr.push(i)

        return arr
    })

    function setValue(value, index) {
        setList((e) => {
            e.splice(index, 1, value)
            return [...e]
        })
    }

    const callbackSetValue = useCallback((e, index) => {
        setValue(e, index)
    }, [])

    return (
        <View className={Style.index}>
            {
                list.map((item, index) => (
                    <CustomWrapper key={index}>
                        <CustomWrapperInput value={String(item)} index={index} onInput={callbackSetValue} />
                    </CustomWrapper>
                ),
                )
            }
        </View>
    )
}
```

```tsx
// customWrapperInput.tsx

function CoustomWrapperInput(props: {
    value: string
    onInput: (e: string, i: number) => void
    index: number
}) {
    console.log(props.value)
    return (
        <View className="diyInput">
            <Input
                className="input"
                value={props.value}
                onInput={e => props.onInput(e.detail.value, props.index)}
            />
        </View>
    )
}

export default memo(CoustomWrapperInput)
```

**注意点**

这里为了保证更改后只重新传染当前这一条数据，传入的`props`中如果带有函数，需要将函数使用`useCallback`包裹

**在手机端验证**

验证后（iphone12）发现问题已修复，跑去找使用的iphone7朋友验证，得到的回复是仍然输入卡顿。

于是我打开了开发者工具的*低端机模式*

**开发者工具低端机模式验证**

得到的也是依旧卡顿

[低端机模式验证视频](http://remember-quick.oss-cn-chengdu.aliyuncs.com/app/db334c9916f74661ddc27afbe6803351.mp4)


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7947a59917c841679a3b4917a6adc04e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1344&h=1586&s=125506&e=png&b=ffffff)

从图片中可以看出，在组件重新渲染后会打印当前传入的value，打印出来的值有断节，并不是和上一条打印结果衔接上的

因为`props.value`更新，重新渲染了`CoustomWrapperInput`组件内的`Input`，因为低端机性能太差，可能出现输入已经输入到了第九个字母，重新渲染的任务才到第4个

既然这样，那么如果使用`input.value = xx`的方案会不会好一点

顺着这个思路，有了以下代码

# 延迟赋值value

```tsx
// index.tsx

export default function Index() {
    const [list, setList] = useState<number[]>(() => {
        const arr = []
        for (let i = 0; i < 500; i++)
            arr.push(i)

        return arr
    })

    function setValue(value, index) {
        setList((e) => {
            e.splice(index, 1, value)
            return [...e]
        })
    }

    const callbackSetValue = useCallback((e, index) => {
        setValue(e, index)
    }, [])

    return (
        <View className={Style.index}>
            {
                list.map((item, index) => (
                    <CustomWrapper>
                        <DiyInput value={String(item)} index={index} onInput={callbackSetValue} key={index} />
                    </CustomWrapper>
                ),
                )
            }
        </View>
    )
}
```

```tsx
// diyInput.tsx

const timer: {
    [key: number]: number
} = {}

function Index(props: {
    value: string
    onInput: (e: string, i: number) => void
    index: number
}) {
    console.log(props.value)
    const inputRef = useRef<{ value: string }>({ value: '' })
    const timerId = useId()
    if (!timer[timerId])
        timer[timerId] = 0

    useEffect(() => {
        return () => {
            delete timer[timerId]
        }
    }, [])

    useEffect(() => {
        clearTimeout(timer[timerId])
        inputRef.current.value = props.value || ''
    }, [props.value])

    const beforeSetValue = useCallback((e) => {
        clearTimeout(timer[timerId])
        timer[timerId] = setTimeout(() => {
            if (props.value !== null && props.value !== 'null') {
                if (inputRef.current)
                    props.onInput && props.onInput(e.detail.value, props.index)
            }
        }, 600)
    }, [])

    return (
        <View className="diyInput">
            <CustomWrapper>
                <input
                    ref={inputRef}
                    className="input"
                    onInput={beforeSetValue}
                />
            </CustomWrapper>
        </View>
    )
}

export default memo(Index)
```

这里的思路是防抖节流，延迟去设置value的值，只要props没有改变，那么当前的组件就不会重新渲染。

为什么采用`ref.value`的方式来赋值呢？

因为`useRef`的更新并不会让组件重新渲染，这样是为了减少重新渲染带来的性能消耗。

[延迟赋值视频](http://remember-quick.oss-cn-chengdu.aliyuncs.com/app/0dcee504ae38ac6d184671a319eaad6f.mp4)

从视频中看到虽然输入时还是会有抖动，因为页面渲染500条input，实际情况并不会有这么多数据。此方案也帮我在项目中解决了iphone7输入卡顿的问题

# ps

多数情况下使用`CustomWrapper`包裹后就不会有此问题，奈何我的甲方使用的是iphone7😮‍💨

在处理这个问题的时候微信`skyline`方案还没有公布，在公布后尝试使用更改为`skyline`渲染，但是出现的样式问题太多，当时项目已经完成了80%，就没有再去更改。

但是我做了一个`skyline`渲染500个输入框的demo验证了一下，效果确实好，完全不卡。后续会考虑将项目升级为此渲染方式。
