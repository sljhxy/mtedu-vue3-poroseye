import { h } from 'vue'
import SvgIcon from '@/components/SvgIcon/index'

export const useIconRender = () => {
  const iconRender = (config) => {
    const { color, fontSize, icon } = config

    if (!icon) {
      console.warn('iconRender: icon is required')
      return () => null
    }

    const style = {
      color,
      fontSize: fontSize ? `${fontSize}px` : undefined
    }

    return () => h(SvgIcon, { icon, style })
  }

  return {
    iconRender
  }
}
