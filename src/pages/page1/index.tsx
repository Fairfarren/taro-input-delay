import { Input, View } from '@tarojs/components'
import { useState } from 'react'
import Style from './index.modules.scss'

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
