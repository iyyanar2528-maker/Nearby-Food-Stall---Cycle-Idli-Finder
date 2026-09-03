import { FoodSpot } from '../types';

export const INITIAL_FOOD_SPOTS: FoodSpot[] = [
  // 1. Moving Cycle Idli Vendor (Tamil Nadu / Maharashtra Mobile Vendor)
  {
    id: 'spot-cycle-1',
    name: 'Muthu Anna Cycle Idli & Hot Vadai',
    nameTa: 'முத்து அண்ணா சைக்கிள் இட்லி & சூடான வடை',
    nameHi: 'मुथु अन्ना साइकिल इडली और गरम वड़ा',
    vendorId: 'vendor-muthu',
    vendorName: 'Muthu Krishnan',
    vendorPhone: '+91 98401 23456',
    category: 'Moving Cycle Stall',
    stallType: 'moving_cycle',
    stateRegion: 'tamil_nadu',
    cityArea: 'T. Nagar / Pondy Bazaar, Chennai',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=70',
    rating: 4.9,
    reviewCount: 384,
    priceRange: '₹',
    topDeal: {
      item: '4x Steaming Hot Idlis + Medu Vada + 2 Chutneys',
      price: 30,
      badge: 'Super Deal ₹30'
    },
    distanceMeters: 65,
    walkingTimeSeconds: 50,
    stepsCount: 82,
    bearingDegrees: 45,
    address: 'Currently cycling near South Usman Road (Moving)',
    openingHours: '6:30 AM – 11:00 AM & 4:30 PM – 8:00 PM',
    isOpenNow: true,
    isMovingNow: true,
    speedKmh: 6,
    dietaryTags: ['Pure Veg', 'Freshly Steamed', 'No Palm Oil'],
    paymentTypes: ['Cash', 'UPI / GPay', 'Paytm'],
    description: 'Traditional bicycle equipped with a large brass steam can carrying piping hot fluffy idlis, crispy medu vadas, fresh coconut chutney, and spicy tomato kara chutney.',
    secretTip: 'Ask for the extra dollop of homemade Podi with pure sesame gingelly oil over your hot idlis for just ₹5 extra!',
    menu: [
      { id: 'm1', name: '4pcs Steaming Hot Idli with Sambhar & Chutney', nameTa: '4 இட்லி சாம்பார் சட்னியுடன்', nameHi: '4 पीस इडली सांभर और चटनी', price: 20, description: 'Melt-in-mouth rice cakes with freshly ground coconut chutney', isBestseller: true, isVegetarian: true },
      { id: 'm2', name: 'Crispy Medu Vada (2pcs)', nameTa: 'சூடான மெது வடை (2)', nameHi: 'कुरकुरा मेदू वड़ा (2 पीस)', price: 20, description: 'Golden crispy urad dal fritters with fresh curry leaves and crushed black pepper', isBestseller: true, isVegetarian: true },
      { id: 'm3', name: 'Idli Vada Combo with Ghee Podi', nameTa: 'இட்லி வடை நெய் பொடி காம்போ', nameHi: 'इडली वड़ा घी पोड़ी कॉम्बो', price: 35, description: '2 Idlis + 1 Vada generously sprinkled with gun powder and ghee', isBestseller: true, isVegetarian: true },
      { id: 'm4', name: 'Filter Degree Kaapi (Flask)', nameTa: 'பில்டர் காபி', nameHi: 'फिल्टर डिग्री कॉफी', price: 15, description: 'Aromatic authentic chicory blend South Indian filter coffee in paper cup', isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
    ],
    liveStatusText: 'Cycling live right now around 65m away!'
  },

  // 2. Maharashtra - Dadar Vada Pav & Chai Handcart
  {
    id: 'spot-mh-1',
    name: 'Aaba Chulivarcha Vada Pav & Masala Chai',
    nameTa: 'ஆபா மராத்தி வடா பாவ் & மசாலா டீ',
    nameHi: 'आबा चुलीवरचा वड़ा पाव और कटिंग चाय',
    vendorId: 'vendor-aaba',
    vendorName: 'Santosh Shinde',
    vendorPhone: '+91 98200 88991',
    category: 'Street Cart',
    stallType: 'handcart',
    stateRegion: 'maharashtra',
    cityArea: 'Dadar West (Near Flower Market), Mumbai',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=70',
    rating: 4.8,
    reviewCount: 650,
    priceRange: '₹',
    topDeal: {
      item: 'Jumbo Vada Pav + Fried Green Chillies + Garlic Chutney',
      price: 15,
      badge: 'Bestseller ₹15'
    },
    distanceMeters: 55,
    walkingTimeSeconds: 42,
    stepsCount: 72,
    bearingDegrees: 120,
    address: 'Station Road corner, opposite Kabutar Khana, Dadar (W)',
    openingHours: '7:00 AM – 10:30 PM',
    isOpenNow: true,
    dietaryTags: ['Pure Veg', 'Freshly Fried', 'Spicy'],
    paymentTypes: ['Cash', 'UPI / GPay', 'Paytm'],
    description: 'Crisp golden spiced potato balls deep fried in fresh batter, layered between fresh pav with dry red garlic coconut chutney and fiery green thecha.',
    secretTip: 'Ask for the crunchy crispy fried gram flour crumbs (chura/boondi) sprinkled inside your pav!',
    menu: [
      { id: 'm1', name: 'Signature Mumbai Vada Pav', nameTa: 'ஸ்பெஷல் வடா பாவ்', nameHi: 'स्पेशल मुंबई वड़ा पाव', price: 15, description: 'Spiced batata vada with lasun dry chutney and salted fried chillies', isBestseller: true, isVegetarian: true },
      { id: 'm2', name: 'Cheese Burst Vada Pav', nameTa: 'சீஸ் வடா பாவ்', nameHi: 'चीज वड़ा पाव', price: 25, description: 'Hot vada stuffed with melted Amul cheese slice', isBestseller: false, isVegetarian: true },
      { id: 'm3', name: 'Kanda Bhaji (Onion Pakoda plate)', nameTa: 'வெங்காய பஜ்ஜி பிளேட்', nameHi: 'कांदा भजी प्लेट', price: 25, description: 'Crispy sliced onion fritters served with tamarind chutney', isVegetarian: true },
      { id: 'm4', name: 'Ginger Adrak Cutting Chai', nameTa: 'இஞ்சி கட்டிங் டீ', nameHi: 'अदरक वाली कटिंग चाय', price: 10, description: 'Boiled creamy spiced kadak masala tea in traditional cutting glass', isBestseller: true, isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // 3. Moving Cycle Poha & Upma Vendor (Maharashtra Pune/Mumbai)
  {
    id: 'spot-cycle-2',
    name: 'Kaka Moving Cycle Tarri Poha & Sheera',
    nameTa: 'காக்கா சைக்கிள் அவல் போஹா & ரவை கேசரி',
    nameHi: 'काका साइकिल तरी पोहा और शीरा',
    vendorId: 'vendor-kaka',
    vendorName: 'Ganesh Kulkarni',
    vendorPhone: '+91 97654 32100',
    category: 'Moving Cycle Stall',
    stallType: 'moving_cycle',
    stateRegion: 'maharashtra',
    cityArea: 'FC Road / Deccan, Pune',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=70',
    rating: 4.9,
    reviewCount: 290,
    priceRange: '₹',
    topDeal: {
      item: 'Plate Kanda Batata Poha + Tarri Gravy + Sev',
      price: 25,
      badge: 'Breakfast Special ₹25'
    },
    distanceMeters: 110,
    walkingTimeSeconds: 85,
    stepsCount: 140,
    bearingDegrees: 280,
    address: 'On bicycle moving along Lane 4 to Main FC Road (110m away)',
    openingHours: '6:00 AM – 11:30 AM',
    isOpenNow: true,
    isMovingNow: true,
    speedKmh: 5,
    dietaryTags: ['Pure Veg', 'Light & Healthy', 'Warm'],
    paymentTypes: ['Cash', 'UPI / GPay'],
    description: 'Yellow turmeric flattened rice tempered with mustard seeds, curry leaves, crunchy roasted peanuts, potatoes, topped with Ratlami sev and fresh lemon juice.',
    secretTip: 'Ask Kaka to add a ladle of his spicy hot chana tarri gravy over the poha for authentic Nagpur style!',
    menu: [
      { id: 'm1', name: 'Nagpuri Tarri Poha Plate with Sev & Onion', nameTa: 'நாக்பூர் தர்ரி போஹா', nameHi: 'नागपुरी तरी पोहा (सेव-नींबू)', price: 25, description: 'Soft spiced poha topped with spicy black gram rassa, crisp sev and raw onions', isBestseller: true, isVegetarian: true },
      { id: 'm2', name: 'Sweet Pineapple Sheera (Kesari)', nameTa: 'அன்னாசி ரவை கேசரி', nameHi: 'पाइनएप्पल रवा शीरा', price: 20, description: 'Ghee-roasted semolina sweet pudding loaded with pineapple chunks', isVegetarian: true },
      { id: 'm3', name: 'Sabudana Khichdi (Upwas Special)', nameTa: 'சவ்வரிசி கிச்சடி', nameHi: 'साबूदाना खिचड़ी', price: 35, description: 'Tapioca pearls roasted with ghee, crushed peanuts and green chillies', isVegetarian: true },
      { id: 'm4', name: 'Kokum Sharbat Cold Bottle', nameTa: 'கோகம் குளிர் பானம்', nameHi: 'कोकम शरबत', price: 15, description: 'Refreshing sweet and tangy digestive kokum extract beverage', isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80'
    ],
    liveStatusText: 'Moving cycle stall within 110m!'
  },

  // 4. Tamil Nadu - Madurai Famous Bun Parotta & Salna Corner
  {
    id: 'spot-tn-1',
    name: 'Madurai Pandian Hot Bun Parotta & Salna',
    nameTa: 'மதுரை பாண்டியன் சூடான பன் பரோட்டா & சால்னா',
    nameHi: 'मदुरै पांडियन बन परोटा और सालना',
    vendorId: 'vendor-pandian',
    vendorName: 'Pandian Thevar',
    vendorPhone: '+91 94433 11223',
    category: 'Fixed Stall',
    stallType: 'fixed_stall',
    stateRegion: 'tamil_nadu',
    cityArea: 'Simmakkal / Meenakshi Amman Temple zone, Madurai',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=300&q=70',
    rating: 4.9,
    reviewCount: 512,
    priceRange: '₹',
    topDeal: {
      item: '2x Fluffy Bun Parotta + Endless Veg Salna Gravy',
      price: 30,
      badge: 'Iconic Madurai ₹30'
    },
    distanceMeters: 75,
    walkingTimeSeconds: 58,
    stepsCount: 95,
    bearingDegrees: 190,
    address: 'Just 75m behind Temple North Tower street',
    openingHours: '5:00 PM – 1:30 AM',
    isOpenNow: true,
    dietaryTags: ['Hot & Crispy', 'Non-Veg Gravy & Veg Salna', 'Street Legend'],
    paymentTypes: ['Cash', 'UPI / GPay'],
    description: 'Thick, fluffy layered dough ball beaten and pan-toasted in hot vegetable ghee till it puffs like a bakery bun, drenched in spicy aromatic Madurai salna gravy.',
    secretTip: 'Crush both bun parottas by hand on your plate before asking the master to drown it completely in thick piping hot empty salna!',
    menu: [
      { id: 'm1', name: 'Madurai Bun Parotta (Set of 2)', nameTa: 'பன் பரோட்டா (2)', nameHi: 'मदुरै बन परोटा (2 पीस)', price: 30, description: 'Golden flaky layered puffed bread with rich aromatic spicy salna', isBestseller: true, isVegetarian: true },
      { id: 'm2', name: 'Kothu Parotta (Egg/Veg)', nameTa: 'கொத்து பரோட்டா', nameHi: 'अंडा/वेज कोथू परोटा', price: 60, description: 'Shredded parotta shredded on tawa with onions, green chillies, curry leaves and egg', isBestseller: true },
      { id: 'm3', name: 'Kal Dosa with Tomato Onion Chutney (2pcs)', nameTa: 'கல் தோசை (2)', nameHi: 'कल डोसा (2 पीस)', price: 35, description: 'Soft spongy thick tawa dosas with three homemade ground chutneys', isVegetarian: true },
      { id: 'm4', name: 'Jigarthanda Mini Cup', nameTa: 'ஸ்பெஷல் ஜிகர்தண்டா', nameHi: 'फेमस जिगरठंडा', price: 30, description: 'Traditional Madurai cooling dessert with almond gum, basundi milk and nannari syrup', isBestseller: true, isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // 5. Maharashtra - Kolhapuri Misal Pav
  {
    id: 'spot-mh-2',
    name: 'Khandeshi Zatka Misal Pav & Taak',
    nameTa: 'மராத்தி காரசாரமான மிசல் பாவ்',
    nameHi: 'खानदेशी झटका मिसळ पाव और ताक',
    vendorId: 'vendor-sanjay',
    vendorName: 'Sanjay Patil',
    vendorPhone: '+91 98811 44556',
    category: 'Small Shop',
    stallType: 'small_shop',
    stateRegion: 'maharashtra',
    cityArea: 'Swargate / Deccan, Pune & Navi Mumbai',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=70',
    rating: 4.8,
    reviewCount: 418,
    priceRange: '₹',
    topDeal: {
      item: 'Kolhapuri Spiced Misal Plate + 2 Butter Pav + Onion Lemon',
      price: 45,
      badge: 'Zatka Deal ₹45'
    },
    distanceMeters: 88,
    walkingTimeSeconds: 68,
    stepsCount: 112,
    bearingDegrees: 340,
    address: 'Near Old Bus Stand Chowk (88m walking)',
    openingHours: '8:00 AM – 9:00 PM',
    isOpenNow: true,
    dietaryTags: ['Pure Veg', 'Spicy Tarri', 'High Protein Sprouted'],
    paymentTypes: ['Cash', 'UPI / GPay', 'Paytm'],
    description: 'Sprouted moth beans cooked in dark fiery Maharashtrian spices, layered with farsan, chopped onions, coriander, and served with unlimited kat (red hot rassa).',
    secretTip: 'Ask for the medium spicy "Medium Rassa" if you have low chilli tolerance!',
    menu: [
      { id: 'm1', name: 'Special Kolhapuri Misal with 2 Pav', nameTa: 'ஸ்பெஷல் மிசல் பாவ்', nameHi: 'स्पेशल कोल्हापुरी मिसळ पाव', price: 45, description: 'Sprouted bean curry topped with spicy farsan, onions, lemon and butter pav', isBestseller: true, isVegetarian: true },
      { id: 'm2', name: 'Extra Butter Pav (Pair of 2)', nameTa: 'கூடுதல் பட்டர் பாவ் (2)', nameHi: 'एक्स्ट्रा बटर पाव (2 पीस)', price: 10, description: 'Fresh bakery pav toasted with Amul butter on griddle', isVegetarian: true },
      { id: 'm3', name: 'Masala Spiced Buttermilk (Taak glass)', nameTa: 'மசாலா மோர்', nameHi: 'मसाला ताक (छाछ)', price: 15, description: 'Chilled freshly churned curd spiced with roasted cumin, green chilli and fresh coriander', isBestseller: true, isVegetarian: true },
      { id: 'm4', name: 'Solkadhi Drink Glass', nameTa: 'சோல்கடி பானம்', nameHi: 'सोलकढ़ी', price: 20, description: 'Traditional Konkani coconut milk drink infused with kokum and garlic', isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // 6. Moving Cycle Chai & Samosa Vendor (Chennai / Mumbai)
  {
    id: 'spot-cycle-3',
    name: 'Ramu Kaka Moving Cycle Chai & Onion Samosa',
    nameTa: 'ராமு காக்கா சைக்கிள் டீ & வெங்காய சமோசா',
    nameHi: 'रामू काका साइकिल चाय और प्याज समोसा',
    vendorId: 'vendor-ramu',
    vendorName: 'Ramu Yadav',
    vendorPhone: '+91 99402 99887',
    category: 'Moving Cycle Stall',
    stallType: 'moving_cycle',
    stateRegion: 'tamil_nadu',
    cityArea: 'Anna Nagar West / Koyambedu, Chennai',
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=300&q=70',
    rating: 4.9,
    reviewCount: 220,
    priceRange: '₹',
    topDeal: {
      item: '4x Mini Onion Patti Samosas + 1 Hot Chai',
      price: 25,
      badge: 'Evening Snack ₹25'
    },
    distanceMeters: 125,
    walkingTimeSeconds: 98,
    stepsCount: 160,
    bearingDegrees: 75,
    address: 'Moving through 2nd Avenue cross street (125m nearby)',
    openingHours: '3:00 PM – 9:00 PM',
    isOpenNow: true,
    isMovingNow: true,
    speedKmh: 4,
    dietaryTags: ['Pure Veg', 'Freshly Fried', 'Crispy'],
    paymentTypes: ['Cash', 'UPI / GPay'],
    description: 'Mobile cycle carrying a giant insulated stainless steel tea canister and hot glass case filled with crunchy triangular mini onion samosas, bread pakodas and biscuits.',
    secretTip: 'The green mint-chilli chutney packet tied to the cycle handlebar is made fresh every 2 hours!',
    menu: [
      { id: 'm1', name: 'Crispy Mini Onion Patti Samosas (4pcs)', nameTa: 'மினி வெங்காய சமோசா (4)', nameHi: 'मिनी प्याज समोसा (4 पीस)', price: 20, description: 'Super crunchy thin-crust triangular samosas with spiced onion filling', isBestseller: true, isVegetarian: true },
      { id: 'm2', name: 'Elaichi Cardamom Hot Milk Tea', nameTa: 'ஏலக்காய் பால் டீ', nameHi: 'इलायची वाली स्पेशल चाय', price: 10, description: 'Rich spiced milk tea infused with freshly crushed green cardamoms', isBestseller: true, isVegetarian: true },
      { id: 'm3', name: 'Crispy Bread Pakoda with Potato filling', nameTa: 'பிரெட் பக்கோடா', nameHi: 'ब्रेड पकोड़ा', price: 15, description: 'Deep fried triangular sandwich in spiced gram flour batter', isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
    ],
    liveStatusText: 'Cycle stall ringing bell ~125m away!'
  },

  // 7. Tamil Nadu - Crispy Ghee Roast Dosa Cart
  {
    id: 'spot-tn-2',
    name: 'Murugan Crispy Ghee Roast Dosa Stall',
    nameTa: 'முருகன் நெய் ரோஸ்ட் தோசை கடை',
    nameHi: 'मुरुगन क्रिस्पी घी रोस्ट डोसा स्टॉल',
    vendorId: 'vendor-murugan',
    vendorName: 'Murugan Chettiar',
    vendorPhone: '+91 98410 55667',
    category: 'Street Cart',
    stallType: 'handcart',
    stateRegion: 'tamil_nadu',
    cityArea: 'Mylapore Tank / Temple Street, Chennai',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=300&q=70',
    rating: 4.9,
    reviewCount: 680,
    priceRange: '₹',
    topDeal: {
      item: 'Paper Crispy Ghee Roast Dosa + 3 Chutneys + Hot Sambhar',
      price: 40,
      badge: 'Pure Ghee ₹40'
    },
    distanceMeters: 60,
    walkingTimeSeconds: 46,
    stepsCount: 78,
    bearingDegrees: 215,
    address: 'Corner of South Mada Street, Mylapore',
    openingHours: '6:30 AM – 11:30 AM & 5:00 PM – 10:30 PM',
    isOpenNow: true,
    dietaryTags: ['Pure Veg', 'Golden Crispy', 'Gluten Free'],
    paymentTypes: ['Cash', 'UPI / GPay', 'Paytm'],
    description: 'Huge cast-iron tawa frying wafer-thin golden dosas sprinkled with fragrant A2 cow ghee, served with thick coconut chutney, mint coriander thogaiyal, and drumstick sambhar.',
    secretTip: 'Ask for the "Karam Podi Roast" where the chef pastes fiery Chettinad chilli garlic chutney directly inside the dosa while roasting!',
    menu: [
      { id: 'm1', name: 'Golden Ghee Paper Roast Dosa', nameTa: 'நெய் பேப்பர் ரோஸ்ட் தோசை', nameHi: 'गोल्डन घी पेपर रोस्ट डोसा', price: 40, description: 'Super thin crispy dosa roasted with pure cow ghee and served with 3 chutneys', isBestseller: true, isVegetarian: true },
      { id: 'm2', name: 'Onion Podi Uthappam', nameTa: 'வெங்காய பொடி ஊத்தப்பம்', nameHi: 'प्याज पोड़ी उत्तपम', price: 45, description: 'Thick spongy pancake topped with heaps of crunchy shallots and gun powder', isVegetarian: true },
      { id: 'm3', name: 'Egg Dosa (Muttai Dosa)', nameTa: 'முட்டை தோசை', nameHi: 'अंडा डोसा (मुत्तई डोसा)', price: 40, description: 'Crispy dosa with farm fresh egg beaten with black pepper and curry leaves', isBestseller: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // 8. Maharashtra - Pune Pav Bhaji & Tawa Pulao
  {
    id: 'spot-mh-3',
    name: 'Balaji Amul Butter Pav Bhaji & Tawa Pulao',
    nameTa: 'பாலாஜி அமுல் பட்டர் பாவ் பாஜி',
    nameHi: 'बालाजी अमूल बटर पाव भाजी और तवा पुलाव',
    vendorId: 'vendor-balaji',
    vendorName: 'Balaji Rao',
    vendorPhone: '+91 98220 33445',
    category: 'Street Cart',
    stallType: 'handcart',
    stateRegion: 'maharashtra',
    cityArea: 'JM Road / Deccan, Pune',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=300&q=70',
    rating: 4.8,
    reviewCount: 520,
    priceRange: '₹',
    topDeal: {
      item: 'Amul Butter Pav Bhaji Plate + 2 Soft Masala Pav',
      price: 60,
      badge: 'Full Meal ₹60'
    },
    distanceMeters: 95,
    walkingTimeSeconds: 74,
    stepsCount: 122,
    bearingDegrees: 15,
    address: 'Opposite Sambhaji Park gate, JM Road',
    openingHours: '4:30 PM – 11:45 PM',
    isOpenNow: true,
    dietaryTags: ['Pure Veg', 'Rich Amul Butter', 'Fresh Veggies'],
    paymentTypes: ['Cash', 'UPI / GPay', 'Paytm'],
    description: 'Mashed potatoes, cauliflower, peas, and tomatoes cooked with special Everest pav bhaji masala on huge iron griddle with overflowing Amul butter cubes.',
    secretTip: 'Ask the tawa master to make your pav "Khada Masala Pav" dipped straight in the sizzling tawa butter juices!',
    menu: [
      { id: 'm1', name: 'Special Amul Butter Pav Bhaji', nameTa: 'ஸ்பெஷல் பட்டர் பாவ் பாஜி', nameHi: 'स्पेशल अमूल बटर पाव भाजी', price: 60, description: 'Spiced vegetable mash loaded with melting butter slab and 2 toasted pavs', isBestseller: true, isVegetarian: true },
      { id: 'm2', name: 'Mumbai Street Style Tawa Pulao', nameTa: 'தவா புலாவ்', nameHi: 'मुंबई स्ट्रीट तवा पुलाव', price: 50, description: 'Basmati rice tossed with pav bhaji gravy, crunchy capsicum and spices', isBestseller: true, isVegetarian: true },
      { id: 'm3', name: 'Cheese Masala Pav (2pcs)', nameTa: 'சீஸ் மசாலா பாவ்', nameHi: 'चीज मसाला पाव', price: 40, description: 'Pav stuffed with bhaji gravy and grated processed cheese', isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'
    ]
  }
];
