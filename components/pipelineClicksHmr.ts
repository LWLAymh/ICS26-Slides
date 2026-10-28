import { slides } from '#slidev/slides'

// Slidev 52 caches each slide's click limits across frontmatter hot updates.
// Reload only when those limits change; the URL preserves the current step.
if (import.meta.hot) {
  const hot = import.meta.hot
  const settings = (frontmatter: Record<string, unknown>) =>
    JSON.stringify([frontmatter.clicks ?? null, frontmatter.clicksStart ?? 0])
  const previous = new Map(slides.value.map(slide => [slide.no, settings(slide.meta.slide.frontmatter)]))

  // Also recover tabs that already had stale limits when this helper loaded.
  if (slides.value.some(({ meta }) => {
    const context = meta.__clicksContext
    const { clicks, clicksStart = 0 } = meta.slide.frontmatter
    return context && ((typeof clicks === 'number' && context.total !== clicks)
      || context.clicksStart !== clicksStart)
  })) window.location.reload()

  const onSlideUpdate = ({ no, data }: { no: number; data: { frontmatter: Record<string, unknown> } }) => {
    const next = settings(data.frontmatter)
    if (previous.has(no) && previous.get(no) !== next) window.location.reload()
    previous.set(no, next)
  }
  hot.on('slidev:update-slide', onSlideUpdate)
  hot.dispose(() => hot.off('slidev:update-slide', onSlideUpdate))
}
