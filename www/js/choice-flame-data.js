// Choice Flame articles — single source of truth.
// Both index.html ("Latest from the Diocese") and choice-flame.html
// ("Recent Highlights") render from this same array, so updating a
// headline here updates it everywhere at once instead of needing to be
// edited by hand in two places.
//
// To add a new item: add an object at the END of the array below (most
// recent last). `pinned: true` items (like the daily Gospel) are treated
// as evergreen and are skipped when picking the homepage's "latest" 3.
window.CHOICE_FLAME_ARTICLES = [
  {
    icon: "📖",
    category: "Daily · Gospel",
    date: "Posted daily",
    title: "Gospel of the Day",
    desc: "A daily Gospel reading and reflection, posted every morning on the Choice Flame Facebook page.",
    link: "https://www.facebook.com/thechoiceflame/",
    pinned: true
  },
  {
    icon: "🕊️",
    category: "News",
    date: "Jan 2026",
    title: "Diocese Leads Igboland Thanksgiving Prayer for Peace",
    desc: "Bishop Onaga called the faithful to a special joint Mass giving thanks for Igboland's deliverance during the Civil War and praying for peace.",
    link: "https://www.facebook.com/thechoiceflame/"
  },
  {
    icon: "✝️",
    category: "News",
    date: "April 2026",
    title: "Auxiliary Bishop Obodo Named Apostolic Administrator of Abakaliki",
    desc: "Most Rev. Ernest Anaezichukwu Obodo, Auxiliary Bishop of Enugu, was appointed to lead the Diocese of Abakaliki.",
    link: "https://www.facebook.com/thechoiceflame/"
  },
  {
    icon: "📢",
    category: "News",
    date: "June 2026",
    title: "Diocese Clarifies Position on Political Rally at the Cathedral",
    desc: "The Diocese distanced itself from an unauthorised political event advertised at Jubilee Hall, Holy Ghost Cathedral.",
    link: "https://www.facebook.com/thechoiceflame/"
  }
];
