/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-11 22:34:30
 * @Description: Coding something
 */
import { Spark, SparkChat } from '../../src';
import Config from './config';

// const spark = new Spark({
//     // 自行填入相关参数
//     secret: Config.secret,
//     key: Config.key,
//     appid: Config.appid,
//     // useHistory: true,
// });

// // console.log(spark.generateUrl());

// spark.chat({
//     content: '你好',
//     onData (d) {
//         console.log('onData:', d);
//     },
//     onEnd (d) {
//         console.log('onEnd:', d);

//         // spark.chat({
//         //     content: '你叫什么',
//         //     onData (d) {
//         //         console.log('onData:', d);
//         //     },
//         //     onEnd (d) {
//         //         console.log('onEnd:', d);
//         //     }
//         // });
//     }
// });


const spark = new Spark({
    // 自行填入相关参数
    secret: Config.secret,
    key: Config.key,
    // useHistory: true,
});

// console.log(spark.generateUrl());

const sparkChat = new SparkChat({
    appid: Config.appid,
    urlGetter: async () => {
        return spark.generateUrl();
    }
});

sparkChat.chat({
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