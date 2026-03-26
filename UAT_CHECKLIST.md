# B2B Partner Portal UAT Checklist

- Login with shared agency credentials (`demo-agency` / `demo1234`) and verify session persists on refresh.
- Open `Properties`, pick a property, run rates+inventory with date range and occupancy.
- Verify B2B total is exactly 10% lower than website total for each room type.
- Submit a bulk requirement from `Quotes -> New requirement` with multiple lines.
- Confirm quote appears in `Quotes` list and detail timeline starts at `NEW`.
- Add comment and verify it appears in quote detail history.
- Change status to `NEGOTIATION`, then `CONFIRMED` or `CANCELLED`.
- Verify partner cannot access another partner's quote ID directly.
- Confirm internal email notification is sent on quote creation (set `B2B_QUOTE_INTERNAL_EMAILS`).
