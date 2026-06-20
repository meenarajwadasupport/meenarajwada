declare module 'embla-carousel-autoplay' {
  import { EmblaPluginType } from 'embla-carousel'
  function Autoplay(options?: { delay?: number; stopOnInteraction?: boolean; stopOnMouseEnter?: boolean }): EmblaPluginType
  export default Autoplay
}
