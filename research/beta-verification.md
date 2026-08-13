# Beta Verification — 2026-08-13

- The public beta URL `https://rootedfit-dczf9puf.manus.space` loaded successfully in the browser.
- The landing screen displayed the RootedFit browser-tester entry flow, navigation tabs, tester feedback and sharing controls, and the first-visit guide.
- The live beta’s specific deployed Git commit cannot be read from the client page. Project deployment status reports the current deployment as successful; the most recently published project release is commit `6e5c3ea`, which supersedes the user-referenced `0fa6689`.

## Workouts-page verification

Using an isolated beta-browser profile with a chair, resistance band, filled bottles, internet access, and a yoga mat, the live Workouts page rendered the expected resource-aware flow. The original Day 1 recommendation used filled bottles and displayed the matched water-bottle demonstration. Opening **Edit gear** worked; adding a yoga mat increased the saved-resource count from four to five and updated the weekly day labels. Marking **Weights or filled bottles** unavailable for today immediately replaced the Day 1 bottle-strength session with a resistance-band strength session and displayed the corresponding resistance-band demonstration. A page reload preserved the temporary “Unavailable today” state while retaining filled bottles in the saved setup, confirming the intended separation between lasting equipment and today-only availability.
