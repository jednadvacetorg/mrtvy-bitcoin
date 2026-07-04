import * as Counterscale from "@counterscale/tracker"

// Encode only the characters that would otherwise cut the URL short when the
// tracker parses `url` via <a>.pathname (`?` starts the query, `#` the hash).
// Keeping them as %3F / %23 lets the query/hash parts remain visible in the path.
function encodeRest(rest: string): string {
  return rest.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")
}

// Returns the segment after `/outbound/`, or null if the link should be ignored.
function buildOutboundPath(a: HTMLAnchorElement): string | null {
  if (a.protocol === "mailto:") {
    return "mailto/" + a.href.slice("mailto:".length)
  }
  if (a.protocol === "tel:") {
    return "tel/" + a.href.slice("tel:".length)
  }
  if (a.protocol === "http:" || a.protocol === "https:") {
    if (a.hostname && a.hostname !== window.location.hostname) {
      return a.hostname + encodeRest(a.pathname + a.search + a.hash)
    }
  }
  return null
}

export default defineNuxtPlugin(() => {
  Counterscale.init({
    siteId: "mrtvy-bitcoin",
    reporterUrl: "/cntrsclc",
  })

  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as Element | null
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null
      if (!a) return

      const seg = buildOutboundPath(a)
      if (!seg) return

      Counterscale.trackPageview({
        url: window.location.origin + "/outbound/" + seg,
      })
    },
    { capture: true },
  )
})
