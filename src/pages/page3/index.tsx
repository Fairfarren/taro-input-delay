import { CustomWrapper, View } from '@tarojs/components'
import {
    useCallback,
    useState,
} from 'react'
import Style from './index.modules.scss'
import DiyInput from './diyInput'

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
