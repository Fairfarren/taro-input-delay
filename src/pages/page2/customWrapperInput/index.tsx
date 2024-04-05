import { Input, View } from '@tarojs/components'
import { memo } from 'react'

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
