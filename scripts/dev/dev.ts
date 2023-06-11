/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-11 22:34:30
 * @Description: Coding something
 */
import { Spark } from '../../src';

const spark = new Spark({
    // 自行填入相关参数
    secret: 'xxx',
    key: 'xxx',
    appid: 'xxx',
    // useHistory: true,
});

// console.log(spark.generateUrl());

spark.chat({
    content: '你好',
    onData (d) {
        console.log('onData:', d);
    },
    onEnd (d) {
        console.log('onEnd:', d);

        // spark.chat({
        //     content: '你叫什么',
        //     onData (d) {
        //         console.log('onData:', d);
        //     },
        //     onEnd (d) {
        //         console.log('onEnd:', d);
        //     }
        // });
    }
});