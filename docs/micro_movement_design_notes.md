# RootedFit Micro-Movement Design Notes

## Practical break design

CDC’s workplace physical-activity-break guide is explicitly designed to help workers fit short 5–10-minute activity breaks into the workday. [1] OSHA’s computer-workstation guidance highlights that task organisation and repetitive work can increase risk factors, and frames movement pauses as part of reducing prolonged-activity concerns. [2]

RootedFit will use these sources to frame the new desk-fitness feature as a **gentle, opt-in movement break**, not treatment. The default desk sequence will take two minutes and use seated or standing neck turns, shoulder rolls, chest opening, wrist mobility, and a short stand-and-reach. Users can set a reminder cadence, but the app will include easy disable and reschedule controls. Any pain, dizziness, numbness, or new symptoms should end the sequence rather than be pushed through.

Local reminders are implemented for native mobile use. The browser preview keeps the same desk-stretch guide but prompts the user to use manual breaks, because the local recurring-notification behaviour is a mobile-device capability. RootedFit requests notification permission only after the user deliberately turns reminders on, and a single control cancels the app’s scheduled desk-break reminders.

## Busy Parent 10-Minute Timer

The Busy Parent module will be deliberately constrained: a visible ten-minute countdown, bodyweight-only moves, simple timer-led intervals, and a single compact circuit. It will not promise body-area outcomes. The default structure is one minute to settle into a comfortable pace, eight minutes of low-complexity movement intervals, and one minute to slow down and breathe.

## Meal frequency rules

Meal frequency is a user preference rather than a wellness score. The app will support one meal plus optional snacks, two meals, and three meals. Each day’s meal card will be mapped to the user’s selection: the same coherent recipe pool becomes one to three scheduled meal slots, and snack suggestions only appear when the user requests them.

## References

[1]: https://stacks.cdc.gov/view/cdc/81144 "CDC: Physical activity breaks for the workplace — resource guide"
[2]: https://www.osha.gov/etools/computer-workstations/work-process "OSHA: Computer Workstations — Work Process and Recognition"
