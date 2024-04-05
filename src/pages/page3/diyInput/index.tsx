import {
    CustomWrapper,
    View,
} from '@tarojs/components'
import {
    memo,
    useCallback,
    useEffect,
    useId,
    useRef,
} from 'react'

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
