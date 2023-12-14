<!--
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
-->
# [Spark-Nodejs](https://github.com/theajack/spark-node)

[讯飞星火认知大模型](https://xinghuo.xfyun.cn/) Nodejs SDK & Web使用

## install 

```
npm i spark-nodejs
```

## 使用

```js
const spark = new Spark({
    // 自行填入相关参数
    secret: 'xxx',
    key: 'xxx',
    appid: 'xxx',
});
const answer = await spark.chat('你好');
```

## 构造参数

```ts
export interface ISparkOptions {
    secret: string; // 从平台获取
    key: string; // 从平台获取
    version?: // 非必须 星火大模型版本号 默认为1，支持1,2,3
    appid?: string; // 应用appid，从开放平台控制台创建的应用中获取
    uid?: string; // 每个用户的id，用于区分不同用户
    temperature?: number; // 取值为[0,1],默认为0.5	核采样阈值。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高
    maxTokens?: number; // 取值为[1,4096]，默认为2048	模型回答的tokens的最大长度
    topK?: number; // 取值为[1，6],默认为4	从k个候选中随机选择⼀个（⾮等概率）
    chatId?: string; // 需要保障用户下的唯一性	用于关联用户会话
    useHistory?: boolean; // 是否需要使用历史对话记录，对token消耗会很快 default: false
    versionStr?: // 非必须 API接口的version字段，默认为'', 表示采用version指代的版本号，该字段为了扩展性考虑，可以传入 vx.x 表示任意版本

}
```

## API

### generateUrl

生成websocket请求 url，可以下发给前端发起ws请求

```js
const url = spark.generateUrl();
```

### chat

直接使用node发起对话

```js
const url = spark.chat({
    content: '你好',
    // onData 表示分段拿到返回结果
    onData({content, start, end, seq}){
      // content 表示分段的内容 
      // start 表示是否是第一段
      // end 表示是否是最后一段
      // seq 表示序号
      console(content, start, end, seq);
    },
    onEnd({content, token, questionTokens}){
      // content 表示完整的返回
      // token 表示返回回答的token数
      // questionTokens 表示发起对话的token数
      console(content, start, end, seq);
    }
});
```

或者使用 chat的Promise返回

```js
const answer = await spark.chat('你好');
```

函数声明

```ts
function chat (options: IQuestionOptions): Promise<string>;

interface IQuestionOptions {
    content: string;
    onData?(options: {content: string; start: boolean; end: boolean, seq: number}): void;
    onEnd?(options: {content: string, tokens: number, questionTokens: number}): void;
}
```

## Web 端使用

spark-node中将消息部分单独打包到 socket 模块，可以在web环境中使用。使用场景为服务端生成url下发，web端调用socket模块发起聊天

```js
import { SparkChat } from "spark-nodejs/chat";
const spark = new SparkChat({url: 'xxx'});
spark.chat({content: 'xxx'}); // chat 参数与上文中的chat参数一致
```

构造参数：

构造参数如下，除了多了 url 与 urlGetter 参数外，其他与上文一致，url与urlGetter填入一个即可

当填入url时，一次请求结束之后需要手动重新获取url设置

当填入urlGetter时，会自动获取url，推荐使用urlGetter

```ts
export interface ISparkSocketOptions {
    url?: string; // 指定url
    urlGetter?: ()=>Promise<string>; // 自动获取url的函数，一般封装获取url的请求
    appid?: string;
    uid?: string;
    temperature?: number; // 取值为[0,1],默认为0.5	核采样阈值。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高
    maxTokens?: number; // 取值为[1,4096]，默认为2048	模型回答的tokens的最大长度
    topK?: number; // 取值为[1，6],默认为4	从k个候选中随机选择⼀个（⾮等概率）
    chatId?: string; // 需要保障用户下的唯一性	用于关联用户会话
    useHistory?: boolean; // default: false
}
```

### cdn使用

```html
<script src='https://cdn.jsdelivr.net/npm/spark-nodejs'></script>
<script>
const spark = new SparkChat({url: 'xxx'});
</script>
```

## 关于 useHistory

开启了 useHistory 之后，Spark-Node 内部会缓存之前的对话上下文，然后在 chat 时一起发送给服务端，所以token消耗会很快，请按需要决定是否开启。

histroyToken的最大限制是8192，超过这个限制时Spark-Node会自动清除最早的记录，知道tokens小于8192。