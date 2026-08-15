#!/usr/bin/env python3
"""Write expanded original GAM bank (8 scenarios × 5 = 40)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "app" / "data"

S1 = (
    "A university facilities team is choosing a temporary water pump for a construction site "
    "12 m below the campus water tank outlet. The pump's maximum suction lift is rated at 8 m "
    "at sea level. The site altitude is 900 m, where the effective suction lift drops by about "
    "1 m per 1000 m of altitude. The discharge pipe length is 40 m with a required flow of "
    "2.5 L/s. Only pumps that can meet suction lift and flow are allowed. Three candidate pumps:\n\n"
    "- Pump X: suction lift 9 m (sea level), flow 3.0 L/s\n"
    "- Pump Y: suction lift 7 m (sea level), flow 2.8 L/s\n"
    "- Pump Z: suction lift 10 m (sea level), flow 2.2 L/s"
)
S2 = (
    "A department surveyed 200 master's applicants about preferred start terms. "
    "120 preferred winter, 50 preferred summer, and 30 marked undecided. "
    "Among winter preferrers, 40% also applied for a scholarship. "
    "Among summer preferrers, 20% applied for a scholarship. "
    "Undecided applicants are excluded from scholarship percentages in the report."
)
S3 = (
    "A lab stores reagent R at 4°C. Shelf life is 90 days unopened, or 14 days after opening. "
    "A bottle opened on 1 March is discarded on 15 March if unused. "
    "Unopened bottles purchased on 1 January expire on 1 April. "
    "The lab must keep at least 2 unexpired unopened bottles as backup whenever an opened bottle is in use."
)
S4 = (
    "A research group has a monthly cloud budget of €600. GPU instances cost €4/hour; "
    "CPU instances cost €1/hour. They must reserve at least 40 GPU-hours for training. "
    "Remaining budget may buy any mix of GPU or CPU hours. Idle reserved GPU-hours are still charged."
)
S5 = (
    "A campus library books study rooms in 60-minute slots from 09:00 to 21:00. "
    "Each room holds at most 6 people. Groups of 5 or more must book a Large room; "
    "groups of 4 or fewer may use Small or Large. Same-day bookings close at 08:00. "
    "Cancelled bookings free the slot immediately. Today is Monday; the desk opens at 08:30."
)
S6 = (
    "A campus shuttle runs every 20 minutes from Gate A to Lab Cluster B between 07:00 and 19:00. "
    "Travel time is 12 minutes. Capacity is 30 seated riders. Standing is not allowed. "
    "Riders with a Lab Cluster sticker board first; others board if seats remain. "
    "The last departure from Gate A is 18:40."
)
S7 = (
    "A department printer gives each student 200 free pages per month. Colour pages cost "
    "3 free-page credits each; black-and-white costs 1 credit each. Extra pages cost €0.05 "
    "per credit after the free allowance. Double-sided prints count as 2 pages. "
    "Jobs that would exceed the free allowance are rejected unless the student opts into paid extras."
)
S8 = (
    "A field-course kit must include: 1 first-aid pack, at least 2 water bottles per person, "
    "and 1 GPS unit for every 4 people (round up). Maximum group size is 12. "
    "Rain covers are required if the forecast shows ≥40% chance of rain. "
    "Today’s forecast is 35% rain. The kit currently has 1 first-aid pack, 18 water bottles, "
    "2 GPS units, and 0 rain covers."
)


def q(sid, title, scenario, n, diff, prompt, options, answer, explanation):
    return {
        "id": f"{sid}-q{n}",
        "type": "gam",
        "difficulty": diff,
        "scenarioId": sid,
        "scenarioTitle": title,
        "scenario": scenario,
        "prompt": prompt,
        "options": [{"id": k, "text": v} for k, v in options],
        "answer": answer,
        "explanation": explanation,
    }


def build() -> list[dict]:
    items = []
    # gam-01 rebalanced
    t, s = "Campus water pump", S1
    items += [
        q("gam-01", t, s, 1, "low", "What is the approximate effective maximum suction lift of Pump X at the site altitude?",
          [("a", "9.0 m"), ("b", "8.1 m"), ("c", "7.0 m"), ("d", "10.0 m")], "b",
          "900 m altitude ≈ 0.9 m loss. Pump X: 9 − 0.9 = 8.1 m."),
        q("gam-01", t, s, 2, "high", "The vertical distance from tank outlet to pump inlet is 12 m. Which statement follows?",
          [("a", "Any of X, Y, Z can provide the needed suction lift at this site."),
           ("b", "No listed pump can provide 12 m suction lift; a different setup is required."),
           ("c", "Only Pump Z works because its sea-level rating exceeds 12 m."),
           ("d", "Pump Y works if flow is ignored.")], "b",
          "Even Z’s effective lift is about 10 − 0.9 = 9.1 m < 12 m."),
        q("gam-01", t, s, 3, "low", "Ignoring suction for a moment, which pumps meet the required flow of 2.5 L/s?",
          [("a", "X and Y only"), ("b", "X and Z only"), ("c", "Y and Z only"), ("d", "All three")], "a",
          "X=3.0 and Y=2.8 meet ≥2.5; Z=2.2 does not."),
        q("gam-01", t, s, 4, "medium", "Which quantity is NOT constrained by the selection rules stated in the scenario?",
          [("a", "Suction lift capability"), ("b", "Flow rate"),
           ("c", "Discharge pipe length of 40 m as a hard pass/fail limit"),
           ("d", "Whether the pump can meet stated suction and flow")], "c",
          "Pipe length is context; pass/fail rules named are suction lift and flow only."),
        q("gam-01", t, s, 5, "high", "A colleague claims Pump Y is usable at this site after altitude correction. The claim is:",
          [("a", "True, because 7 m > 0.9 m loss."),
           ("b", "False for suction: effective lift ≈ 6.1 m, still far below 12 m needed."),
           ("c", "True, because Y meets flow."),
           ("d", "True if the tank is pressurized.")], "b",
          "Effective Y ≈ 7 − 0.9 = 6.1 m ≪ 12 m."),
    ]
    # gam-02
    t, s = "Course survey response rates", S2
    items += [
        q("gam-02", t, s, 1, "low", "How many surveyed applicants preferred winter?",
          [("a", "50"), ("b", "120"), ("c", "30"), ("d", "200")], "b", "Stated directly: 120 preferred winter."),
        q("gam-02", t, s, 2, "low", "How many winter preferrers applied for a scholarship?",
          [("a", "40"), ("b", "48"), ("c", "60"), ("d", "80")], "b", "40% of 120 = 48."),
        q("gam-02", t, s, 3, "medium", "Total scholarship applicants among winter + summer preferrers?",
          [("a", "58"), ("b", "48"), ("c", "10"), ("d", "70")], "a", "48 + 10 = 58."),
        q("gam-02", t, s, 4, "low", "What fraction of all 200 applicants preferred summer?",
          [("a", "1/4"), ("b", "1/5"), ("c", "3/10"), ("d", "1/2")], "a", "50/200 = 1/4."),
        q("gam-02", t, s, 5, "high", "Which inference is NOT supported?",
          [("a", "More applicants preferred winter than summer."),
           ("b", "Exactly 15 undecided applicants applied for scholarships."),
           ("c", "Undecided responses are 15% of the sample."),
           ("d", "Scholarship rate is higher among winter preferrers than summer preferrers.")], "b",
          "Undecided scholarship counts are excluded; 15 is not given."),
    ]
    # gam-03
    t, s = "Lab reagent shelf life", S3
    items += [
        q("gam-03", t, s, 1, "low", "An unopened bottle purchased on 1 January expires on:",
          [("a", "15 January"), ("b", "1 April"), ("c", "1 March"), ("d", "14 February")], "b",
          "Purchased 1 Jan → expires 1 April."),
        q("gam-03", t, s, 2, "low", "Maximum days an opened bottle may be kept:",
          [("a", "7"), ("b", "14"), ("c", "90"), ("d", "30")], "b", "Opened shelf life is 14 days."),
        q("gam-03", t, s, 3, "low", "While one opened bottle is in use, the minimum number of unexpired unopened backup bottles required is:",
          [("a", "0"), ("b", "1"), ("c", "2"), ("d", "4")], "c", "Policy: at least 2 backups."),
        q("gam-03", t, s, 4, "high", "On 20 March, one bottle is open (opened 10 March) and the lab holds two unopened bottles purchased 1 January. Compliant?",
          [("a", "No — unopened bottles from 1 January are already expired."),
           ("b", "No — an opened bottle cannot be kept past 7 days."),
           ("c", "Yes — opened bottle and both backups are still within stated limits on 20 March."),
           ("d", "No — only one backup is allowed while a bottle is open.")], "c",
          "Opened 10 Mar OK until 24 Mar; unopened valid until 1 Apr; two backups OK."),
        q("gam-03", t, s, 5, "medium", "Which change would violate a stated rule if an opened bottle remains in use?",
          [("a", "Holding only one unexpired unopened backup bottle"),
           ("b", "Storing reagent at 4°C"),
           ("c", "Discarding an opened bottle on day 14"),
           ("d", "Buying a new unopened bottle on 1 February")], "a",
          "Fewer than 2 backups violates the backup rule."),
    ]
    # gam-04
    t, s = "Shared compute budget", S4
    items += [
        q("gam-04", t, s, 1, "low", "Minimum spend required for the 40 GPU-hour reservation?",
          [("a", "€40"), ("b", "€160"), ("c", "€240"), ("d", "€600")], "b", "40 × €4 = €160."),
        q("gam-04", t, s, 2, "medium", "After paying for 40 GPU-hours, how much budget remains?",
          [("a", "€440"), ("b", "€560"), ("c", "€400"), ("d", "€160")], "a", "600 − 160 = 440."),
        q("gam-04", t, s, 3, "high", "With remaining €440 after the minimum GPU reservation, maximum additional GPU-hours purchasable (integer hours)?",
          [("a", "110"), ("b", "100"), ("c", "440"), ("d", "40")], "a", "440 / 4 = 110."),
        q("gam-04", t, s, 4, "medium", "If they buy only CPU hours with the remaining €440, how many CPU-hours can they buy?",
          [("a", "110"), ("b", "440"), ("c", "160"), ("d", "600")], "b", "€1/hour → 440 hours."),
        q("gam-04", t, s, 5, "high", "Which statement is true?",
          [("a", "Unused reserved GPU-hours are free."),
           ("b", "Unused reserved GPU-hours are still charged."),
           ("c", "CPU hours cost more than GPU hours."),
           ("d", "The budget forbids CPU hours.")], "b",
          "Scenario states idle reserved GPU-hours are still charged."),
    ]

    # gam-05 Library rooms — 2L 2M 1H
    t, s = "Study room booking", S5
    items += [
        q("gam-05", t, s, 1, "low", "How long is each booking slot?",
          [("a", "30 minutes"), ("b", "60 minutes"), ("c", "90 minutes"), ("d", "120 minutes")], "b",
          "Slots are 60 minutes."),
        q("gam-05", t, s, 2, "low", "A group of 6 must book which room type?",
          [("a", "Small only"), ("b", "Large only"), ("c", "Either Small or Large"), ("d", "No room — group too big")], "b",
          "Groups of 5+ must book Large."),
        q("gam-05", t, s, 3, "medium", "A group of 4 arrives at 09:00 Monday wanting a same-day slot. Based on the rules:",
          [("a", "Same-day booking is still open at 09:00."),
           ("b", "Same-day booking closed at 08:00, so this path is not available under stated rules."),
           ("c", "They must book Large because 4 ≥ 4."),
           ("d", "They need 7 people to book.")], "b",
          "Same-day bookings close at 08:00."),
        q("gam-05", t, s, 4, "medium", "Maximum people allowed in any booked room?",
          [("a", "4"), ("b", "5"), ("c", "6"), ("d", "8")], "c", "Each room holds at most 6."),
        q("gam-05", t, s, 5, "high", "Which claim is NOT supported by the scenario?",
          [("a", "Cancelled bookings free the slot immediately."),
           ("b", "The desk can override the 08:00 same-day cutoff for VIPs."),
           ("c", "Booking hours span 09:00–21:00."),
           ("d", "Groups of 3 may use a Small room.")], "b",
          "No VIP override is stated."),
    ]

    # gam-06 Shuttle — 1L 2M 2H
    t, s = "Campus shuttle", S6
    items += [
        q("gam-06", t, s, 1, "low", "How often does the shuttle depart from Gate A during service hours?",
          [("a", "Every 10 minutes"), ("b", "Every 20 minutes"), ("c", "Every 30 minutes"), ("d", "Hourly")], "b",
          "Every 20 minutes."),
        q("gam-06", t, s, 2, "medium", "If a shuttle leaves Gate A at 10:00, when does it arrive at Lab Cluster B?",
          [("a", "10:08"), ("b", "10:12"), ("c", "10:20"), ("d", "10:30")], "b", "Travel time is 12 minutes."),
        q("gam-06", t, s, 3, "medium", "Maximum seated riders per departure?",
          [("a", "20"), ("b", "25"), ("c", "30"), ("d", "Unlimited if standing")], "c",
          "Capacity 30 seated; standing not allowed."),
        q("gam-06", t, s, 4, "high", "A rider without a sticker arrives when 30 sticker holders are already boarding. Outcome under the rules?",
          [("a", "They board because capacity is flexible."),
           ("b", "They cannot board: seats are full and standing is forbidden."),
           ("c", "They displace one sticker holder."),
           ("d", "They must wait for the 19:00 departure.")], "b",
          "Sticker holders fill all 30 seats; standing not allowed."),
        q("gam-06", t, s, 5, "high", "Which departure is allowed?",
          [("a", "Gate A at 18:40"), ("b", "Gate A at 19:00"), ("c", "Gate A at 19:20"), ("d", "Gate A at 06:40")], "a",
          "Last departure from Gate A is 18:40; service starts 07:00."),
    ]

    # gam-07 Printer — 1L 3M 1H
    t, s = "Printer page quota", S7
    items += [
        q("gam-07", t, s, 1, "low", "Free page credits per student per month?",
          [("a", "100"), ("b", "150"), ("c", "200"), ("d", "300")], "c", "200 free pages."),
        q("gam-07", t, s, 2, "medium", "Credits used by 10 colour pages (single-sided)?",
          [("a", "10"), ("b", "20"), ("c", "30"), ("d", "3")], "c", "Colour = 3 credits each → 30."),
        q("gam-07", t, s, 3, "medium", "Credits used by 5 double-sided black-and-white sheets?",
          [("a", "5"), ("b", "10"), ("c", "15"), ("d", "2")], "b",
          "Double-sided counts as 2 pages × 1 credit = 10."),
        q("gam-07", t, s, 4, "medium", "A student has 0 free credits left and prints 20 black-and-white credits with paid extras. Cost?",
          [("a", "€0.05"), ("b", "€1.00"), ("c", "€0.50"), ("d", "Free")], "b",
          "20 × €0.05 = €1.00."),
        q("gam-07", t, s, 5, "high", "Student has 5 free credits left, opts out of paid extras, and submits a 10-credit black-and-white job. Result?",
          [("a", "Job prints; overage is free."),
           ("b", "Job is rejected under the stated rules."),
           ("c", "Job prints in colour automatically."),
           ("d", "Only 5 pages print.")], "b",
          "Jobs exceeding free allowance are rejected unless paid extras are opted in."),
    ]

    # gam-08 Field kit — 0L 2M 3H (need L4 M9 H7 from new: so far L3 M7 H4, need L1 M2 H3 more)
    # Wait recount new so far:
    # 05: 2L 2M 1H
    # 06: 1L 2M 2H
    # 07: 1L 3M 1H
    # Subtotal: L4 M7 H4 — need from 08: L0 M2 H3 → total new L4 M9 H7. Good.
    t, s = "Field-course kit", S8
    items += [
        q("gam-08", t, s, 1, "medium", "For a group of 8 people, how many GPS units are required (round up)?",
          [("a", "1"), ("b", "2"), ("c", "3"), ("d", "4")], "b", "8/4 = 2 exactly."),
        q("gam-08", t, s, 2, "medium", "For a group of 9 people, minimum water bottles required?",
          [("a", "9"), ("b", "18"), ("c", "12"), ("d", "2")], "b", "At least 2 per person → 18."),
        q("gam-08", t, s, 3, "high", "Group size 10 with current kit stock. GPS requirement met?",
          [("a", "Yes — 2 GPS units cover 10 people."),
           ("b", "No — 10 people need 3 GPS units (round up), but only 2 are stocked."),
           ("c", "Yes — GPS is optional under 12 people."),
           ("d", "No — first-aid pack is missing.")], "b",
          "10/4 → 2.5 → 3 GPS; kit has 2."),
        q("gam-08", t, s, 4, "high", "With today’s 35% rain forecast, are rain covers required?",
          [("a", "Yes — any chance of rain requires covers."),
           ("b", "No — requirement triggers at ≥40%, and today is 35%."),
           ("c", "Yes — covers are always mandatory."),
           ("d", "Cannot tell — forecast units are unknown.")], "b",
          "Threshold is ≥40%; 35% does not trigger."),
        q("gam-08", t, s, 5, "high", "Which statement follows from the givens alone?",
          [("a", "The kit is ready for a full group of 12 without adding GPS units."),
           ("b", "Water bottles on hand (18) are enough for at most 9 people under the 2-per-person rule."),
           ("c", "Rain covers must be packed today."),
           ("d", "First-aid packs must number one per person.")], "b",
          "18 bottles ÷ 2 = 9 people max; 12 would need 24 bottles and 3 GPS."),
    ]

    return items


def main():
    items = build()
    assert len(items) == 40
    from collections import Counter
    c = Counter(i["difficulty"] for i in items)
    print("difficulty:", dict(c))
    assert c["low"] >= 12 and c["medium"] >= 12 and c["high"] >= 12
    for it in items:
        assert it["answer"] in {o["id"] for o in it["options"]}
    (DATA / "gam.json").write_text(json.dumps(items, indent=2), encoding="utf-8")
    print(f"Wrote {len(items)} GAM items")


if __name__ == "__main__":
    main()
