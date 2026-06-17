// ============================================================================
//  EDIT YOUR WORDING HERE
// ============================================================================
//
//  This file holds all the text that appears on screen — titles, headings,
//  button labels, the sign-in screen, and the descriptions under each page.
//
//  HOW TO EDIT:
//   • Only change the words INSIDE the "quote marks".
//   • Do NOT change the word before the colon (e.g. title:), the quote marks,
//     or the commas. Those are needed to keep things working.
//   • Save / commit, and your live site updates in about a minute.
//
//  EXAMPLE — to change the big title on the sign-in screen, find:
//        appName: "NCFE Operations Hub",
//  and change only the words in quotes:
//        appName: "Safe Haven Compliance Portal",
//
// ============================================================================

export const content = {

  // ==========================================================================
  //  BRANDING  — appears on the sign-in screen AND the sidebar
  // ==========================================================================
  brand: {
    org:     "Safe Haven-A Ray of Hope",            // small text above the big title
    appName: "Education and Training",   // the big title
    tagline: "NCFE Operations Hub",         // small italic line under the title (sidebar only)
  },

  // ==========================================================================
  //  SIGN-IN SCREEN
  // ==========================================================================
  signIn: {
    subtitle: "Sign in to continue",
    footer:   "Encrypted at rest · Audit logged · UK GDPR compliant infrastructure",
  },

  // ==========================================================================
  //  SIDEBAR MENU LABELS  (the clickable items down the left)
  // ==========================================================================
  nav: {
    dashboard: "Overview",
    centre:    "Centre Details",
    eqa:       "EQA Criteria",
    policies:  "Policies",
    learners:  "Learners",
    staff:     "Staff",
    exams:     "Exam Sessions",
    iqa:       "IQA Sampling",
    docs:      "Documents",
    account:   "Account",
  },

  // ==========================================================================
  //  PAGE HEADINGS
  //  Each page has three bits:
  //    eyebrow     = the small UPPERCASE label above the heading
  //    title       = the big heading
  //    description = the sentence(s) underneath
  // ==========================================================================
  pages: {

    dashboard: {
      eyebrow:     "Operations Hub",
      title:       "Centre Approval Readiness",
      description: "Progress across the 24 EQA criteria. Six criteria are pre-marked Not Applicable based on the qualifications in scope. All data is stored in your secure Supabase backend.",
    },

    centre: {
      eyebrow:     "Section 1",
      title:       "Centre Details & Contacts",
      description: "Official centre information and key role-holders for NCFE registration. Update names here whenever a role changes, and reflect the change formally via NCFE's Change of Centre Contact Details form (criterion 3.19).",
    },

    eqa: {
      eyebrow:     "Section 3 (24 Criteria)",
      title:       "EQA Review Criteria",
      description: "Each criterion from the NCFE Centre Approval Report. Click any criterion to expand it, log evidence references, attach supporting documents, and record status.",
    },

    policies: {
      eyebrow:     "Compliance",
      title:       "Policy Register",
      description: "The 16 senior-management-supported policies required by criterion 3.1 are pre-loaded. Open each to record version, owner, review dates, and upload the actual document.",
    },

    learners: {
      eyebrow:     "Learner Management",
      title:       "Learner Records",
      description: "Enrolment tracking, ID verification, qualification progress, and per-learner document storage (ID scans, enrolment forms, assessment evidence).",
    },

    staff: {
      eyebrow:     "Human Resources",
      title:       "Staff Register",
      description: "Competency, right-to-work, DBS, CPD records, plus per-staff document storage (CV, DBS certificate, qualifications, contract). Supports criteria 3.3–3.6.",
    },

    exams: {
      eyebrow:     "Secure Assessment",
      title:       "Exam Session Log",
      description: "JCQ-compliant session records with attendance registers and ID verification audit trail. Supports criteria 3.14 and 3.15.",
    },

    iqa: {
      eyebrow:     "Quality Assurance",
      title:       "IQA Sampling Log",
      description: "Internal Quality Assurance decisions, feedback to assessors, and action tracking. Supports criterion 3.12.",
    },

    docs: {
      eyebrow:     "General Repository",
      title:       "NCFE Documents Library",
      description: "A central place for documents that don't belong to a specific learner or staff member: official NCFE communications, qualification specifications, JCQ documents, brand guidelines, photographs of premises, certificates, and so on.",
    },

    account: {
      eyebrow:     "Account",
      title:       "Your Account",
      description: "Sign-in details and password management.",
    },

  },

  // ==========================================================================
  //  MAIN BUTTONS  (the action button at the top-right of each page)
  // ==========================================================================
  buttons: {
    addContact: "Add Contact",
    addPolicy:  "Add Policy",
    addLearner: "Add Learner",
    addStaff:   "Add Staff",
    newSession: "New Session",
    newSample:  "New Sample",
  },

};
