const { withAndroidManifest } = require('expo/config-plugins')

module.exports = function withHomeLauncher(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0]
    if (!application) return config

    const mainActivity = (application.activity ?? []).find(
      (activity) => activity.$?.['android:name'] === '.MainActivity'
    )
    if (!mainActivity) return config

    const filters = mainActivity['intent-filter'] ?? []
    const hasHome = filters.some((filter) =>
      (filter.category ?? []).some(
        (category) => category.$?.['android:name'] === 'android.intent.category.HOME'
      )
    )

    if (!hasHome) {
      filters.push({
        action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.HOME' } },
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        ],
      })
    }

    mainActivity['intent-filter'] = filters
    return config
  })
}
