---
name: core-pricing-sources
description: 官方费率来源清单，以及 DeepSeek 空闲/高峰时段、OpenAI 处理档位/上下文档位与促销、USD/CNY 汇率的取值规则。
---

# 官方价格来源

费率以官方页面为准：不要沿用记忆里的旧费率，回答中引用支持费率和计费类别的页面。

| 来源 | 官方页面 | 核对内容 |
| --- | --- | --- |
| DeepSeek API（中国官网） | <https://api-docs.deepseek.com/zh-cn/quick_start/pricing/> | 人民币单价、精确模型、缓存命中/未命中、输出和空闲时段/高峰时段 |
| OpenAI API 汇总价目 | <https://developers.openai.com/api/docs/pricing> | 处理档位、上下文长度、促销及汇总价格 |
| OpenAI API 模型详情 | `https://developers.openai.com/api/docs/models/<model-id>`（用精确模型 ID 替换占位符） | 汇总页缺少型号或费率时，核对模型 ID 与各 Token 类别价格 |
| OpenAI API 缓存规则 | <https://developers.openai.com/api/docs/guides/prompt-caching> | 缓存写入费率、适用模型和缓存 Token 报告口径 |
| 美元兑人民币汇率 | <https://open.er-api.com/v6/latest/USD> | USD/CNY（`rates.CNY`）及供应商更新时间（`time_last_update_utc`） |

## DeepSeek

价格优先采用中文官网列示的人民币单价，不用英文页美元价替代。该页面区分高峰时段与空闲时段，时段定义以页面为准、每次回查，不要凭记忆套用。按历史用量精算时，按记录时间逐段套价，并自行确认该时段确属高峰（法定节假日与调休以官方公告为准）；汇总数据没有时段明细时，不要自行拆分：用户指定了时段就按其时段计算并标注假设，否则按「默认口径」取时段并标注假设。

## OpenAI API

价目页可能按 Standard、Batch、Flex、Fast、长上下文或区域处理分别列价。

- 用户未指定处理模式时，默认按 Standard 取价，**不必**在结论中罗列档位与上下文档位说明；用户指定其他模式、或用量记录能确认对应模式时，按其模式取价并在结论中说明。
- 促销价须确认模型适用范围、有效期和资格；不要把某个模型的优惠价套给整个系列。
- 部分模型的长上下文费率按单次请求的输入长度判断，不按累计输入总量判断。只有汇总总量时，不要把总 Token 数当成一个超长请求；默认按 Standard、短上下文计算，并说明该假设。
- 美元价需要换算成人民币时，按 [核算规则](core-cost-calculation.md) 的 USD/CNY 更新时间和本地查询时间规则统一折算。

<!--
Source references:
- https://api-docs.deepseek.com/zh-cn/quick_start/pricing/
- https://developers.openai.com/api/docs/pricing
- https://developers.openai.com/api/docs/guides/prompt-caching
- https://open.er-api.com/v6/latest/USD
-->
