---
name: turn-token-usage
description: Report the token usage and prompt-cache hit rate of the current conversation turn by parsing the DeepSeek V4 for Copilot extension log. Use when the user asks for token usage, cache hit rate, prompt cache stats, per-turn usage, or 缓存命中率 / token 用量.
metadata:
  author: lntvow
  version: '2026.10.11'
---

# Turn Token Usage

## When to Use

- 用户要求「每次对话结束都汇报本轮 token 用量与缓存命中率」
- 排查 prompt cache 命中率异常（未命中 token 暴涨）
- 需要按轮次汇总输入（命中 / 未命中）与输出 token

## Source

本机 DeepSeek 扩展日志，取修改时间最新的一个：

`%APPDATA%\Code\logs\<窗口时间戳>\window1\exthost\Vizards.deepseek-v4-for-copilot\DeepSeek.log`

每次 API 调用一行（带时间戳）：

```
2026-10-11 02:20:50.358 [info] [background] tokens #122: model=deepseek-v4-flash prompt=229771 completion=1099 | cache: hit=229376 miss=395 rate=100% | chars/tok=2.67
```

- `prompt` = 输入 token；`completion` = 输出 token
- `hit` = 命中缓存、`miss` = 未命中（`hit + miss = prompt`）

## Procedure

1. **定时间窗**：本轮 = `[上一条用户消息时间, 本条用户消息时间)`。结束点用会话里的 `current_datetime`，起始点用上一条用户消息的时间（或沿用上一轮报告的最后一条日志编号作为起点）。
2. **聚合**：把窗口内所有日志行的 `hit` / `miss` / `completion` 分别相加。
3. **输出卡片**：按下方固定格式。

脚本（Windows PowerShell；`$Since` / `$Until` 为窗口边界，省略则不限）：

```powershell
param([string]$Since, [string]$Until)
$f = @(Get-ChildItem "$env:APPDATA\Code\logs\*\window*\exthost\Vizards.deepseek-v4-for-copilot\DeepSeek.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending)[0]
if (-not $f) { "no log"; return }
$rows = foreach ($line in (Select-String -Path $f.FullName -Pattern 'tokens #\d+').Line) {
  if ($line -match '^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\.\d+ \[info\] .*tokens #(\d+): model=(\S+) prompt=(\d+) completion=(\d+) \| cache: hit=(\d+) miss=(\d+)') {
    [pscustomobject]@{ ts=$matches[1]; n=[int]$matches[2]; prompt=[int]$matches[4]; completion=[int]$matches[5]; hit=[int]$matches[6]; miss=[int]$matches[7] }
  }
}
if ($Since) { $rows = $rows | Where-Object { $_.ts -ge $Since } }
if ($Until) { $rows = $rows | Where-Object { $_.ts -lt $Until } }
$hit=($rows|Measure-Object hit -Sum).Sum; $miss=($rows|Measure-Object miss -Sum).Sum; $out=($rows|Measure-Object completion -Sum).Sum
$total=$hit+$miss+$out
function Fmt($n){ if($n -ge 1000000){"{0:0.##}M" -f ($n/1000000)}elseif($n -ge 1000){"{0:0.0}K" -f ($n/1000)}else{"$n"} }
"calls={0}  n={1}..{2}" -f @($rows).Count,$rows[0].n,$rows[-1].n
"输入 · 命中缓存    {0}   {1}%" -f (Fmt $hit),  [math]::Round(100*$hit/$total,1)
"输入 · 未命中缓存  {0}   {1}%" -f (Fmt $miss), [math]::Round(100*$miss/$total,1)
"输出              {0}   {1}%" -f (Fmt $out),  [math]::Round(100*$out/$total,1)
"合计              {0}" -f (Fmt $total)
"命中率            {0}%" -f [math]::Round(100*$hit/($hit+$miss),1)
```

## Output (exact format)

无 emoji、三列表格；标题带时间窗 `code` 徽章：

```
### 本轮对话用量　`HH:MM:SS → HH:MM:SS`

| 项目 | Tokens | 占比 |
|:--|--:|--:|
| 输入 · 命中缓存 | **444.8K** | 98.5% |
| 输入 · 未命中缓存 | 676 | 0.1% |
| 输出 | 5.9K | 1.3% |
| **合计** | **451.4K** | 100% |
```

- 合计 = 命中 + 未命中 + 输出；占比 = 各 / 合计（1 位小数）
- 单位：≥1M 用 `M`（2 位小数）、≥1K 用 `K`（1 位小数）、否则原样
- 命中率（按需）= `hit / (hit + miss)`

## Notes

- 一轮对话 = 多次 API 调用（每次工具调用一步），需把窗口内所有行相加。
- 日志在调用完成后才写入 → 本轮最后一次调用（正在生成的那条回复）不计入。
- 这是扩展日志口径；VS Code 内置用量卡片口径可能不同、数值会有出入。
- 路径为 Windows（`%APPDATA%`）；macOS 为 `~/Library/Application Support/Code/logs/...`。
