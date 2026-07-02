export default defineAppConfig({
  ui: {
    colors: {
      // Solid black/white primary is set via CSS variables in
      // app/assets/css/main.css, since `primary: 'black'` is unsupported
      // (`black` has no 50-950 shades) and caused inverted component colors.
      neutral: 'zinc',
    },
  },
})
