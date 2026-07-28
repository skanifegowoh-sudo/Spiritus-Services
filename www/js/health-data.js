// Diocesan Health Services — centre directory used by health.html
// Source: 2025 Diocesan Directory. `phone`/`email` are the proprietor's own
// direct contact where the Directory lists one; otherwise null, and the
// request form falls back to the Diocesan Health Office / Chancery.
window.HEALTH_CENTRES = [
  // Hospitals
  { name: "Annunciation Specialist Hospital", category: "Hospitals", phone: null, email: null },
  { name: "Godfrey Okoye University Teaching Hospital", category: "Hospitals", phone: null, email: null },
  { name: "Nne Nke Ebere Catholic Community Hospital and Primary Health Care Centre", category: "Hospitals", phone: null, email: null },
  { name: "Mother of Christ Specialist Hospital", category: "Hospitals", phone: null, email: null },

  // Maternity & Medical Centres
  { name: "St. Theresa Maternity Hospital", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "Aru Ike Ndi Oria, Primary Healthcare/Maternity & Medical Centre", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "Eze Nwaanyi Nke Udo, Primary Healthcare / Maternity & Medical Centre", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "Inye Aka Ndi I Kristi Catholic Maternity", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "St. Anne Maternity", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "Our Lady of Lourdes Maternity", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "St. Anthony Maternity", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "Ukamaka Cottage Hospital & Maternity", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "Ave Maria Eye Clinic", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "St. Anthony Clinic & Maternity", category: "Maternity & Medical Centres", phone: null, email: null },
  { name: "Bishop C.V.C Onaga Hospital & Maternity", category: "Maternity & Medical Centres", phone: null, email: null },

  // Care Homes
  { name: "Little Sisters of the Poor Mother of Perpetual Help Home for the Elderly", category: "Care Homes", phone: "08064771061", email: null },
  { name: "Motherless Babies Home", category: "Care Homes", phone: "08083092021", email: null },
  { name: "Guardian Angels Motherless Babies Home (GAMB)", category: "Care Homes", phone: null, email: null },
  { name: "DDL Charity Home", category: "Care Homes", phone: "08035658094", email: null },
  { name: "DDL Pro-life Centre (Home)", category: "Care Homes", phone: "08031391400", email: null },
  { name: "St. Michael Motherless Babies Home", category: "Care Homes", phone: null, email: null }
];

// Fallback contact used whenever a centre has no direct phone/email listed.
window.HEALTH_GENERAL_CONTACT = {
  label: "Diocesan Health Office / Chancery",
  phone: "+2348033375672",
  email: "cathsen1@yahoo.com"
};
