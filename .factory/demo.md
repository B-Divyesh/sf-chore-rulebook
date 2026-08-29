# Demo sandbox

- URL: <https://chore-rulebook.sociobot.in/demo>
- Local URL: <http://127.0.0.1:4173/demo>
- Entry: select **Try it with sample data** on the first screen, or open `/demo` directly.
- Sample: Cedar House, Alex, Bo, Casey, four recurring chores, and four completion records. Casey starts away so assignment explanations show absence handling.
- Storage: demo changes use IndexedDB database `demo:chore-rulebook`. Real data uses `chore-rulebook`; demo mode never opens that database.
- Reset: **Reset demo** deletes only `demo:chore-rulebook` and reloads the bundled sample.
- Exit: **Start for real** deletes the demo database and opens `/`. Real rulebook data is unchanged.

The service worker precaches `/demo` and the sample is generated in the app, so the demo works offline after the first visit.
