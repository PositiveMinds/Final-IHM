#!/usr/bin/env python3

# Additional 30 patient records
new_records = [
    "PAT1051,Steven Ackah,44,M,256736789012,steven.ackah@email.com,Fort Portal Referral Hospital,facility-fortportal-008,HIV,11/11/2025,17/01/2026,9:00 AM,Scheduled,Stable condition,Fort Portal,91%,Undetectable",
    "PAT1052,Theresa Addai,38,F,256724789012,theresa.addai@email.com,Mbarara Referral Hospital,facility-mbarara-008,Hypertension,05/11/2025,26/01/2026,2:00 PM,Confirmed,BP monitoring needed,Mbarara,N/A,N/A",
    "PAT1053,Uriel Agbo,58,M,256737890123,uriel.agbo@email.com,Jinja Referral Hospital,facility-jinja-008,Diabetes,22/10/2025,23/01/2026,10:30 AM,No-Show,Needs follow-up lab tests,Jinja,N/A,N/A",
    "PAT1054,Yvonne Akyeampong,35,F,256725890123,yvonne.akyeampong@email.com,Arua Medical Center,facility-arua-008,Mixed (HIV+Diabetes),16/11/2025,13/01/2026,11:00 AM,Completed,Viral suppression achieved,Arua,87%,Undetectable",
    "PAT1055,Zachary Amartey,51,M,256738901234,zachary.amartey@email.com,Masaka Referral Hospital,facility-masaka-008,HIV,02/11/2025,29/01/2026,3:30 PM,Scheduled,Patient reports improvement,Masaka,94%,Undetectable",
    "PAT1056,Abigail Ansah,41,F,256726901234,abigail.ansah@email.com,Soroti Health Center IV,facility-soroti-008,Asthma,13/11/2025,21/01/2026,9:00 AM,Confirmed,Medication adjustment required,Soroti,N/A,N/A",
    "PAT1057,Benjamin Asmah,46,M,256739012345,benjamin.asmah@email.com,Kampala Health Center IV,facility-kampala-009,Maternal Health,18/10/2025,25/01/2026,2:00 PM,Rescheduled,BP monitoring needed,Kampala,N/A,N/A",
    "PAT1058,Charlotte Asuah,37,F,256727012345,charlotte.asuah@email.com,Fort Portal District Hospital,facility-fortportal-009,HIV,24/11/2025,07/01/2026,10:30 AM,No-Show,Stable condition,Fort Portal,85%,Low",
    "PAT1059,Douglas Asiamah,53,M,256740123456,douglas.asiamah@email.com,Mbarara Medical Center,facility-mbarara-009,Hypertension,06/11/2025,20/01/2026,11:00 AM,Scheduled,Medication adjustment required,Mbarara,N/A,N/A",
    "PAT1060,Emma Asiedu,29,F,256728123456,emma.asiedu@email.com,Jinja Health Center IV,facility-jinja-009,Mixed (HIV+Diabetes),11/11/2025,14/01/2026,3:30 PM,Completed,Viral suppression achieved,Jinja,90%,Undetectable",
    "PAT1061,Felix Atieno,55,M,256741234567,felix.atieno@email.com,Arua Referral Hospital,facility-arua-009,Diabetes,28/10/2025,22/01/2026,9:00 AM,Confirmed,Needs follow-up lab tests,Arua,N/A,N/A",
    "PAT1062,Gloria Attakora,43,F,256729234567,gloria.attakora@email.com,Masaka District Hospital,facility-masaka-009,HIV,19/11/2025,16/01/2026,2:00 PM,Rescheduled,Patient reports improvement,Masaka,89%,Undetectable",
    "PAT1063,Harold Ava,49,M,256742345678,harold.ava@email.com,Soroti Referral Hospital,facility-soroti-009,Asthma,04/11/2025,27/01/2026,10:30 AM,No-Show,BP monitoring needed,Soroti,N/A,N/A",
    "PAT1064,Iris Awuah,32,F,256730345678,iris.awuah@email.com,Kampala Medical Center,facility-kampala-010,Maternal Health,21/10/2025,30/01/2026,11:00 AM,Scheduled,Stable condition,Kampala,N/A,N/A",
    "PAT1065,Jerome Ayensu,57,M,256743456789,jerome.ayensu@email.com,Fort Portal Medical Center,facility-fortportal-010,Mixed (HIV+Diabetes),15/11/2025,12/01/2026,3:30 PM,Completed,Viral suppression achieved,Fort Portal,92%,Undetectable",
    "PAT1066,Karen Ayesha,40,F,256731456789,karen.ayesha@email.com,Mbarara Health Center IV,facility-mbarara-010,HIV,09/11/2025,19/01/2026,9:00 AM,Scheduled,Medication adjustment required,Mbarara,88%,Undetectable",
    "PAT1067,Leonard Baah,52,M,256744567890,leonard.baah@email.com,Jinja Medical Center,facility-jinja-010,Hypertension,31/10/2025,24/01/2026,2:00 PM,Confirmed,Needs follow-up lab tests,Jinja,N/A,N/A",
    "PAT1068,Lydia Baiden,36,F,256732567890,lydia.baiden@email.com,Arua Health Center III,facility-arua-010,Diabetes,14/11/2025,11/01/2026,10:30 AM,No-Show,Patient reports improvement,Arua,N/A,N/A",
    "PAT1069,Marcus Bailey,48,M,256745678901,marcus.bailey@email.com,Masaka Referral Hospital,facility-masaka-010,Mixed (HIV+Diabetes),23/10/2025,21/01/2026,11:00 AM,Rescheduled,BP monitoring needed,Masaka,86%,Moderate",
    "PAT1070,Naomi Baird,34,F,256733678901,naomi.baird@email.com,Soroti Medical Center,facility-soroti-010,HIV,17/11/2025,15/01/2026,3:30 PM,Completed,Viral suppression achieved,Soroti,87%,Undetectable",
    "PAT1071,Obadiah Baker,61,M,256746789012,obadiah.baker@email.com,Kampala Specialized Hospital,facility-kampala-011,Asthma,07/11/2025,23/01/2026,9:00 AM,Scheduled,Stable condition,Kampala,N/A,N/A",
    "PAT1072,Ophelia Baldwin,39,F,256734789012,ophelia.baldwin@email.com,Fort Portal Health Center IV,facility-fortportal-011,Maternal Health,12/11/2025,17/01/2026,2:00 PM,Confirmed,Medication adjustment required,Fort Portal,N/A,N/A",
    "PAT1073,Percival Banda,50,M,256747890123,percival.banda@email.com,Mbarara District Hospital,facility-mbarara-011,HIV,20/10/2025,28/01/2026,10:30 AM,No-Show,Needs follow-up lab tests,Mbarara,83%,Low",
    "PAT1074,Priscilla Banks,44,F,256735890123,priscilla.banks@email.com,Jinja District Hospital,facility-jinja-011,Mixed (HIV+Diabetes),29/10/2025,20/01/2026,11:00 AM,Rescheduled,Patient reports improvement,Jinja,91%,Undetectable",
    "PAT1075,Quincy Bannerman,56,M,256748901234,quincy.bannerman@email.com,Arua Medical Center,facility-arua-011,Hypertension,11/11/2025,25/01/2026,3:30 PM,Completed,BP monitoring needed,Arua,N/A,N/A",
    "PAT1076,Rachel Barrera,31,F,256736901234,rachel.barrera@email.com,Masaka Health Center IV,facility-masaka-011,HIV,25/10/2025,19/01/2026,9:00 AM,Scheduled,Viral suppression achieved,Masaka,95%,Undetectable",
    "PAT1077,Raymond Barros,47,M,256749012345,raymond.barros@email.com,Soroti District Hospital,facility-soroti-011,Diabetes,16/11/2025,22/01/2026,2:00 PM,Confirmed,Stable condition,Soroti,N/A,N/A",
    "PAT1078,Rita Barry,38,F,256737012345,rita.barry@email.com,Kampala National Hospital,facility-kampala-012,Mixed (HIV+Diabetes),03/11/2025,18/01/2026,10:30 AM,No-Show,Medication adjustment required,Kampala,84%,Moderate",
    "PAT1079,Ronald Barton,54,M,256750123456,ronald.barton@email.com,Fort Portal Referral Hospital,facility-fortportal-012,Asthma,21/10/2025,26/01/2026,11:00 AM,Rescheduled,Needs follow-up lab tests,Fort Portal,N/A,N/A",
    "PAT1080,Rosalind Basile,43,F,256738123456,rosalind.basile@email.com,Mbarara Referral Hospital,facility-mbarara-012,HIV,10/11/2025,24/01/2026,3:30 PM,Completed,Patient reports improvement,Mbarara,89%,Undetectable",
]

# Read existing file
with open('Patient_Appointments_Sample_Data.csv', 'r') as f:
    existing_data = f.read()

# Append new records
with open('Patient_Appointments_Sample_Data.csv', 'a') as f:
    for record in new_records:
        f.write('\n' + record)

print(f"Successfully added {len(new_records)} new patient appointment records!")
print(f"Total records now: {len(new_records) + 50}")
