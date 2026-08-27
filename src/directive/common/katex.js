/**
 * v-katex 显示端 LaTeX 渲染
 *
 * 在 v-html 渲染富文本的容器上加 v-katex，容器内的 LaTeX 会被 KaTeX 渲染成公式：
 *   $$...$$  块级（独占一行、居中）
 *   $...$    行内
 *   \(...\)  行内  \[...\]  块级（兼容这两种写法）
 *
 * 说明：
 * - 入库的仍是 LaTeX 源码文本（由编辑器以普通文字录入），渲染只发生在浏览器显示时。
 * - 仅在元素挂载 / 内容更新时渲染一次，不会与 TinyMCE 编辑端冲突（编辑端不实时预览）。
 * - 与 kityformula 插入的 <img data-latex> 互不干扰（auto-render 只处理文本节点）。
 */
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/contrib/mhchem'   // 化学方程式宏 \ce{...}（mhchem 扩展，注册到 katex 全局）
import 'katex/dist/katex.min.css'

const renderMath = (el) => {
  if (!el) return
  renderMathInElement(el, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ],
    throwOnError: false
  })
}

export default {
  mounted(el) {
    renderMath(el)
  },
  updated(el) {
    renderMath(el)
  }
}
