(() => {
  'use strict';

  window.SPIRITUS_KNOWLEDGE = {
    version: '4.1.0',
    updated: '2026-09-08',

    contacts: {
      chancery: {
        name: 'Catholic Secretariat / Chancery',
        phoneDisplay: '+234 811 511 9318',
        phone: '+2348115119318',
        email: 'cathsen1@yahoo.com',
        address: 'Holy Ghost Cathedral / Catholic Secretariat, Ogui, Enugu, Nigeria',
        postal: 'P. O. Box 302, Enugu',
        hours: 'Monday to Friday, 8:00 a.m. to 5:00 p.m.'
      },
      pastoralEmergency: {
        name: 'Pastoral Emergency',
        phoneDisplay: '+234 903 466 6870',
        phone: '+2349034666870',
        hours: '24 hours, 7 days'
      },
      domus: {
        name: 'Domus Sanctorum Guest House & Eatery',
        administrator: 'Fr. Kenneth Nnaji',
        phoneDisplay: '0803 549 9545',
        phone: '+2348035499545',
        mapsSearch: 'https://www.google.com/maps/search/?api=1&query=Domus%20Sanctorum%20Guest%20House%20Enugu%20Nigeria',
        source: 'Catholic Diocese of Enugu — Posting 2026',
        note: 'Posting 2026 provides the administrator and phone number, but not room rates, menu, opening hours, booking rules, street address or verified GPS coordinates.'
      },
      choiceFlame: {
        name: 'The Choice Flame',
        phoneDisplay: '0818 036 4135',
        phone: '+2348180364135',
        email: 'dchoiceflame@yahoo.com',
        facebook: 'https://www.facebook.com/thechoiceflame/'
      }
    },

    diocese: {
      established: '12 November 1962',
      originalParishes: 17,
      parishes: 219,
      parishPostingEntries: 229,
      parishAssignmentSource: 'Catholic Diocese of Enugu — Posting 2026',
      deaneries: 6,
      territory: '2,738 square kilometres',
      faithful: 'over 1.4 million Catholics',
      diocesanPriests: 531,
      religiousWomen: 669,
      majorSeminarians: 168,
      minorSeminarians: 410,
      bishop: 'Most Rev. Callistus V. C. Onaga',
      auxiliaryBishop: 'Most Rev. Ernest A. Obodo',
      emeritusBishop: 'Most Rev. Anthony O. Gbuji',
      chancellor: 'Very Rev. Fr. Wilfred Chidi Agubuchie'
    },

    dataSources: {
      parishAssignments: 'Catholic Diocese of Enugu — Posting 2026',
      parishCount: '219 declared in the six deanery headings of Posting 2026',
      publicChanceryOverride: '+234 811 511 9318',
      contactPolicy: 'Posting 2026 does not provide parish phone/email details. Older 2025 parish contacts are not assumed current.'
    },

    parishSchedule: {
      label: 'Regular parish Mass schedule',
      sundayMorning: ['6:00 a.m.', '8:30 a.m.', '10:00 a.m.'],
      sundayEvening: '6:00 p.m.',
      weekdayMorning: '6:00 a.m.',
      weekdayEvening: '6:00 p.m.',
      chapel: 'The chapel is open every day.',
      caution: 'Mass times can change on special liturgical occasions. Please contact the parish directly for confirmation or personal enquiries.'
    },

    works: {
      live: [
        'Pipe Repairs',
        'Leak Detection',
        'Bathroom Installation',
        'Water Tank Installation',
        'Borehole Plumbing',
        'Drainage Maintenance'
      ],
      comingSoon: [
        'Electrical Works',
        'Carpentry',
        'Painting',
        'Tiling & Masonry',
        'CCTV & Networking',
        'Solar Installation'
      ]
    },

    faithCentres: [
      { type: 'retreat', name: 'Upper Room Prayer Centre', details: 'Director: Rev. Fr. Anthony Nnaji (with Igwe Obinna Kenneth)', location: 'Emmanuel Town, Ugwuomu Nike, Enugu' },
      { type: 'retreat', name: 'Divine Love Retreat and Conference Centre (DRACC)', details: 'Proprietor: DDL (Daughters of Divine Love). Chaplaincy: Fr. Daniel Ogbodo', location: 'P.O. Box 50, Emene, Enugu' },
      { type: 'retreat', name: 'Materdomini House — Spirituality & Retreat Centre', details: 'Superior & Administrator: Fr. Vincent Ezezue, C.Ss.R.', location: 'No. 6 Etukwu Nwagbo Street, Alulu Nike, Enugu' },

      { type: 'pilgrimage', name: 'National Pilgrimage Centre of Mother of Perpetual Help', details: 'Director: Fr. Desmond Ebulue, C.Ss.R.', location: 'Ugwogo-Nike, Enugu' },
      { type: 'pilgrimage', name: 'Our Lady of Mount Calvary Cistercian Abbey', details: 'Abbot & Superior: Fr. Kevin Onyima', location: 'Awhum, P.O. Box 698, Enugu' },

      { type: 'prayer', name: 'Upper Room Ministries', details: 'Rev. Fr. Anthony Nnaji / Rev. Fr. Ejike Paulinus Nnamdi — Posting 2026', location: 'Emmanuel Town, Ugwuomu Nike, Enugu' },
      { type: 'prayer', name: 'Catholic Adoration Ministry Enugu', details: 'Rev. Fr. Mbaka Camilius Ejike — Posting 2026', location: 'Adoration Centre, Emene' },

      { type: 'pastoral', name: 'Enugu Diocesan Catechetical / Pastoral Centre', details: 'Director: Rev. Fr. Kenneth Obodoagu; Assistant Director: Rev. Fr. Ede Emmanuel C.; Bursar: Rev. Fr. Ifoegbuike Augustine — Posting 2026', location: 'Ugwu Di Nso, Eke, P.O. Box 1513, Enugu' },
      { type: 'pastoral', name: 'Enugu Diocesan Individual, Marriage, Family and Group Counselling Centre', details: 'Director: Fr. Anthony Okeke', location: '1–3 Ikwuato St., Uwani, Enugu' },
      { type: 'pastoral', name: 'Enugu Diocesan Therapeutic Centre', details: 'Rev. Fr. Benneth Ugwu and other Priests', location: '49 Ukwuru Street, Trans-Ekulu' },

      { type: 'vocational', name: 'Nazareth Vocational Skill Centre', details: 'Proprietor: CWO', location: '78 Agbani Road, Coal Camp, Enugu' },
      { type: 'vocational', name: 'Olu Aka Di Mma Vocational Industrial Technical Training Centre', details: 'Proprietor: Diocesan', location: 'Coal Camp (Ogbete), Enugu' },
      { type: 'vocational', name: 'St. Mark Comprehensive Vocational Institute', details: 'Proprietor: Diocesan', location: 'Umana-Ndiagu, Ezeagu L.G.A.' }
    ],

    faq: [
      {
        id: 'find_parish',
        category: 'Parishes',
        question: 'How do I find a parish?',
        triggers: ['find parish','locate parish','parish near','church location','which parish','parish directory'],
        answer: 'Tell me the parish name, town, deanery, or parish priest. I will search the diocesan directory. I will not choose a parish at random.',
        prompt: 'Please type the parish name, town, deanery, or priest name.'
      },
      {
        id: 'mass_times',
        category: 'Parishes',
        question: 'What are the regular Mass times?',
        triggers: ['mass time','mass times','sunday mass','weekday mass','evening mass','morning mass','mass schedule'],
        answer: 'The regular schedule is Sunday 6:00 a.m., 8:30 a.m. and 10:00 a.m.; Sunday evening 6:00 p.m.; weekdays 6:00 a.m. and 6:00 p.m. The chapel is open every day. Tell me a parish name so I can show its parish contact and directions too.'
      },
      {
        id: 'chapel',
        category: 'Parishes',
        question: 'Is the chapel open?',
        triggers: ['chapel open','church open','chapel opening'],
        answer: 'The chapel is open every day. For access arrangements or other personal enquiries, please contact the parish directly.'
      },
      {
        id: 'baptism',
        category: 'Sacraments',
        question: 'How do I arrange a baptism?',
        triggers: ['baptism','baptise','baptize','christening'],
        answer: 'Baptism arrangements are handled by the parish. Please contact the parish where the baptism will take place for the current requirements, dates and preparation. I will not invent parish-specific requirements.'
      },
      {
        id: 'marriage',
        category: 'Sacraments',
        question: 'How do I arrange a Catholic marriage?',
        triggers: ['marriage','wedding','matrimony','marriage preparation'],
        answer: 'Marriage preparation and parish wedding arrangements are handled by the parish. Canonical dispensations, investigations or tribunal matters must be handled by the appropriate diocesan office through the Chancery.'
      },
      {
        id: 'funeral',
        category: 'Sacraments',
        question: 'How do I arrange a funeral Mass?',
        triggers: ['funeral','burial','requiem'],
        answer: 'Please contact the parish directly to arrange a funeral Mass or burial. The parish will confirm the priest, date, time and local requirements.'
      },
      {
        id: 'mass_intention',
        category: 'Sacraments',
        question: 'How do I book a Mass intention?',
        triggers: ['mass intention','book mass','offering for mass'],
        answer: 'Please contact the parish directly to request a Mass intention and confirm the available date and parish procedure.'
      },
      {
        id: 'confession',
        category: 'Sacraments',
        question: 'When is Confession?',
        triggers: ['confession','reconciliation','penance'],
        answer: 'Confession times vary by parish. Please tell me the parish name so I can give you its contact details, or contact the parish directly to confirm.'
      },
      {
        id: 'chancery',
        category: 'Chancery',
        question: 'How do I contact the Chancery?',
        triggers: ['chancery','secretariat','diocesan office','bishop office','headquarters','catholic secretariat'],
        answer: 'The Catholic Secretariat / Chancery is at Holy Ghost Cathedral, Ogui, Enugu. Phone: +234 811 511 9318. Email: cathsen1@yahoo.com. Office hours: Monday to Friday, 8:00 a.m. to 5:00 p.m.'
      },
      {
        id: 'emergency',
        category: 'Chancery',
        question: 'What are the emergency contacts?',
        triggers: ['emergency','urgent','pastoral emergency'],
        answer: 'For Spiritus Sanctus Works / Chancery emergency contact, call +234 811 511 9318. The separately listed pastoral emergency line is +234 903 466 6870. Both emergency lines are listed as 24/7.'
      },
      {
        id: 'bishop',
        category: 'Diocese',
        question: 'Who is the Bishop of Enugu?',
        triggers: ['bishop of enugu','current bishop','who is bishop','bishop onaga'],
        answer: 'The Bishop of Enugu is Most Rev. Callistus V. C. Onaga. The Auxiliary Bishop is Most Rev. Ernest A. Obodo, and the Emeritus Bishop is Most Rev. Anthony O. Gbuji.'
      },
      {
        id: 'chancellor',
        category: 'Diocese',
        question: 'Who is the Diocesan Chancellor?',
        triggers: ['chancellor','diocesan chancellor'],
        answer: 'The Diocesan Chancellor listed on the portal is Very Rev. Fr. Wilfred Chidi Agubuchie. The Chancery contact is +234 811 511 9318 and cathsen1@yahoo.com.'
      },
      {
        id: 'history',
        category: 'Diocese',
        question: 'When was the Diocese of Enugu established?',
        triggers: ['history of diocese','when established','when was diocese','1962','established'],
        answer: 'The Catholic Diocese of Enugu was established on 12 November 1962, carved out of the Archdiocese of Onitsha. It began with 17 parishes. The 2026 Posting headings declare 219 parishes across six deaneries; the posting tables also include additional outstation/work-up/pastoral listings.'
      },
      {
        id: 'schools',
        category: 'Education',
        question: 'How do I find a Catholic school?',
        triggers: ['school','schools','education','college','university'],
        answer: 'I can search the diocesan Schools Directory by school name, location or head. Tell me the school or place you are looking for.'
      },
      {
        id: 'health',
        category: 'Health',
        question: 'How do I find a diocesan hospital or health centre?',
        triggers: ['hospital','health centre','maternity','clinic','care home'],
        answer: 'I can search the diocesan Health Directory by facility name or category. The portal lists hospitals, maternity/medical centres and care homes.'
      },
      {
        id: 'domus_hospitality',
        category: 'Hospitality',
        question: 'How do I contact Domus Sanctorum Guest House & Eatery?',
        triggers: ['domus','domus sanctorum','guest house','guesthouse','accommodation','lodging','room booking','book a room','eatery','restaurant','where can i stay','place to stay'],
        answer: 'Domus Sanctorum Guest House & Eatery is treated as one diocesan hospitality facility. Posting 2026 lists Fr. Kenneth Nnaji as Administrator of Domus Guest House. Phone: 0803 549 9545. Please call directly for room availability, bookings, eatery service, current prices, menu or opening information because those details are not published in Posting 2026.'
      },
      {
        id: 'works',
        category: 'Services',
        question: 'Which Spiritus Sanctus Works services are live?',
        triggers: ['plumber','plumbing','service','services','works','technician','repair'],
        answer: 'Currently live: Pipe Repairs, Leak Detection, Bathroom Installation, Water Tank Installation, Borehole Plumbing and Drainage Maintenance. Electrical, Carpentry, Painting, Tiling & Masonry, CCTV & Networking, and Solar Installation are listed as coming soon.'
      },
      {
        id: 'retreat',
        category: 'Faith & Formation',
        question: 'Where can I go for a retreat?',
        triggers: ['retreat','retreat centre','retreat center','spiritual retreat'],
        answer: 'The portal lists Upper Room Prayer Centre, Divine Love Retreat and Conference Centre (DRACC), and Materdomini House — Spirituality & Retreat Centre.'
      },
      {
        id: 'pilgrimage',
        category: 'Faith & Formation',
        question: 'What pilgrimage centres are listed?',
        triggers: ['pilgrimage','pilgrimage centre','pilgrimage center','awhum','ugwogo'],
        answer: 'The portal lists the National Pilgrimage Centre of Mother of Perpetual Help at Ugwogo-Nike and Our Lady of Mount Calvary Cistercian Abbey at Awhum.'
      },
      {
        id: 'prayer',
        category: 'Faith & Formation',
        question: 'What prayer ministries are listed?',
        triggers: ['prayer ministry','adoration','upper room ministry'],
        answer: 'The portal lists Upper Room Ministries at Ugwuomu Nike and Catholic Adoration Ministry Enugu at Emene.'
      },
      {
        id: 'counselling',
        category: 'Faith & Formation',
        question: 'Where can I find counselling or pastoral support?',
        triggers: ['counselling','counseling','pastoral centre','pastoral center','therapeutic','family counselling','marriage counselling'],
        answer: 'The portal lists the Enugu Diocesan Catechetical / Pastoral Centre, the Individual, Marriage, Family and Group Counselling Centre at Uwani, and the Enugu Diocesan Therapeutic Centre at Trans-Ekulu.'
      },
      {
        id: 'vocational',
        category: 'Faith & Formation',
        question: 'What vocational centres are listed?',
        triggers: ['vocational','skills centre','skills center','technical training'],
        answer: 'The portal lists Nazareth Vocational Skill Centre, Olu Aka Di Mma Vocational Industrial Technical Training Centre, and St. Mark Comprehensive Vocational Institute.'
      },
      {
        id: 'choice_flame',
        category: 'Media',
        question: 'How do I reach The Choice Flame?',
        triggers: ['choice flame','newspaper','diocesan newspaper','facebook feed'],
        answer: 'The Choice Flame is the official diocesan publication section. Phone: 0818 036 4135. Email: dchoiceflame@yahoo.com. Its Facebook page and live feed are linked from the Choice Flame page.'
      },
      {
        id: 'notices',
        category: 'Notices',
        question: 'Where are current diocesan notices?',
        triggers: ['announcement','announcements','notice','notices','latest notice','ordination','transfer','retreat notice'],
        answer: 'Current diocesan notices are on the Notices page. For time-sensitive official information, open that page rather than relying on a remembered answer.'
      }
    ]
  };
})();