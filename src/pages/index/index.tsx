import { Button, View } from '@tarojs/components'
import { navigateTo } from '@tarojs/taro'
import Style from './index.modules.scss'

export default function Index() {
    return (
        <View className={Style.index}>
            <View>
                <Button onClick={() => navigateTo({ url: '/pages/page1/index' })}>问题demo</Button>
            </View>
            <View>
                <Button onClick={() => navigateTo({ url: '/pages/page2/index' })}>CustomWrapper优化后</Button>
            </View>
            <View>
                <Button onClick={() => navigateTo({ url: '/pages/page3/index' })}>延迟赋值</Button>
            </View>
        </View>
    )
}
