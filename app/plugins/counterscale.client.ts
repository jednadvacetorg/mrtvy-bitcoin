import * as Counterscale from "@counterscale/tracker"

export default defineNuxtPlugin(() => {
  Counterscale.init({
    siteId: "mrtvy-bitcoin",
    reporterUrl: "/cntrsclc",
  })
})
