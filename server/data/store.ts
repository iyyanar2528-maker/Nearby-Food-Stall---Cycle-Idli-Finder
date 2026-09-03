import { DatabaseService, database } from '../db/database';
import {
  FoodSpot,
  SubscriptionPlan,
  UserSubscription,
  CustomerOrder,
  UserProfile,
  LiveBroadcastState
} from '../types';

export const SEED_PLANS: SubscriptionPlan[] = [
  // 1. Customer Passes
  {
    id: 'plan-customer-idli-pass',
    title: 'Daily Morning Cycle Idli Pass (30 Days)',
    titleTa: 'தினசரி காலை சைக்கிள் இட்லி பாஸ் (30 நாட்கள்)',
    titleHi: 'दैनिक सुबह साइकिल इडली पास (30 दिन)',
    targetRole: 'customer',
    price: 499,
    period: 'monthly',
    popular: true,
    badge: 'Best Value • Save ₹400',
    savingsText: 'Get 4 piping hot idlis + vada at your doorstep every morning!',
    deliveriesCount: 30,
    features: [
      '30 Days of fresh steaming hot Idlis & Chutney',
      'Doorstep proximity audio bell ring alert (100m away)',
      'Free Sunday Ghee Podi & Crispy Medu Vada upgrade',
      'Pause or resume anytime with 1-click calendar',
      'Zero delivery charge • Direct from cycle vendor'
    ],
    featuresTa: [
      '30 நாட்களுக்கு சூடான இட்லி & சட்னி பாஸ்',
      'சைக்கிள் உங்கள் தெருவிற்கு வரும்போது ஆடியோ மணி ஒலி',
      'ஞாயிற்றுக்கிழமைகளில் இலவச நெய் பொடி & வடை',
      'எப்போது வேண்டுமானாலும் இடைநிறுத்தலாம் / தொடரலாம்',
      'டெலிவரி கட்டணம் இல்லை'
    ],
    featuresHi: [
      '30 दिनों तक ताज़ा गरम इडली और चटनी',
      'साइकिल पास आते ही 100m पर रिंगटोन अलर्ट',
      'रविवार को मुफ़्त घी पोड़ी और मेदू वड़ा',
      'कभी भी 1-क्लिक में पॉज़ या रीज़्यूम करें',
      'ज़ीरो डिलीवरी चार्ज'
    ]
  },
  {
    id: 'plan-customer-mumbai-pass',
    title: 'Mumbai Street Breakfast Club (30 Days)',
    titleTa: 'மும்பை ஸ்ட்ரீட் காலை உணவு கிளப் (30 நாட்கள்)',
    titleHi: 'मुंबई स्ट्रीट ब्रेकफास्ट क्लब (30 दिन)',
    targetRole: 'customer',
    price: 699,
    period: 'monthly',
    badge: 'Popular Mumbai Pass',
    savingsText: 'Daily Crispy Vada Pav / Kanda Poha + Special Cutting Chai',
    deliveriesCount: 30,
    features: [
      'Daily 2x Crispy Mumbai Vada Pav or Fresh Kanda Poha',
      '1x Authentic Spiced Ginger Cutting Chai',
      'Priority morning pickup counter • Skip the queue',
      'Valid at 12+ partner stalls in Dadar & Bandra'
    ],
    featuresTa: [
      'தினசரி 2 வடா பாவ் அல்லது காந்தா போஹா',
      '1 ஸ்பெஷல் இஞ்சி கட்டிங் டீ',
      'வரிசையில் நிற்காமல் உடனடி பிக்கப்',
      'தாதர் & பாந்த்ராவில் உள்ள அனைத்து ஸ்டால்களிலும் செல்லும்'
    ],
    featuresHi: [
      'दैनिक 2 क्रिस्पी वड़ा पाव या कांदा पोहा',
      '1 स्पेशल अदरक कटिंग चाय',
      'बिना लाइन में लगे तुरंत पिकअप',
      'दादर और बांद्रा के 12+ स्टॉल्स पर मान्य'
    ]
  },
  {
    id: 'plan-customer-chennai-coffee',
    title: 'Chennai Filter Kaapi & Tiffin Pass (15 Days)',
    titleTa: 'சென்னை பில்டர் காபி & டிபன் பாஸ் (15 நாட்கள்)',
    titleHi: 'चेन्नई फिल्टर कॉफी और टिफिन पास (15 दिन)',
    targetRole: 'customer',
    price: 349,
    period: '15days',
    badge: 'Pure South Special',
    savingsText: 'Fresh Kumbakonam Degree Coffee + Mini Tiffin',
    deliveriesCount: 15,
    features: [
      '15 Days of brass-flask Degree Filter Coffee',
      'Choice of 2 Podi Idlis or 1 Mini Masala Dosa',
      'Freshly prepared coconut & coriander chutney'
    ],
    featuresTa: [
      '15 நாட்கள் தூய கும்பகோணம் டிகிரி காபி',
      '2 பொடி இட்லி அல்லது மினி மசாலா தோசை',
      'புதிய தேங்காய் மற்றும் கொத்தமல்லி சட்னி'
    ],
    featuresHi: [
      '15 दिन असली कुंभकोणम डिग्री फिल्टर कॉफी',
      '2 पोड़ी इडली या 1 मिनी मसाला डोसा',
      'ताज़ा नारियल और धनिया चटनी'
    ]
  },

  // 2. Vendor SaaS Plans (For Moving Stalls & Shops)
  {
    id: 'plan-vendor-cycle-pro',
    title: 'Cycle Pro Rider License',
    titleTa: 'சைக்கிள் ப்ரோ ரைடர் லைசென்ஸ்',
    titleHi: 'साइकिल प्रो राइडर लाइसेंस',
    targetRole: 'vendor',
    price: 199,
    period: 'monthly',
    popular: true,
    badge: 'Top for Cycle Idli Vendors',
    savingsText: 'Boost daily orders by 300% with live radar alerts',
    features: [
      'Unlimited Live GPS Radar Broadcast to 500m radius',
      'Proximity Audio Bell Ping sent to all nearby foodies',
      'Live Remaining Stock Counter & Flash Discounts',
      'Daily Subscriber Delivery List & Pre-orders Book',
      'Direct UPI payment integration with 0% commission'
    ],
    featuresTa: [
      '500 மீட்டர் சுற்றளவில் வரம்பற்ற நேரடி GPS ரேடார் ஒளிபரப்பு',
      'அருகிலுள்ள அனைத்து வாடிக்கையாளர்களுக்கும் ஆடியோ மணி ஒலி',
      'நேரடி இருப்பு எண்ணிக்கை & தள்ளுபடி சலுகைகள்',
      'தினசரி சந்தாதாரர் டெலிவரி பட்டியல்',
      '0% கமிஷன் நேரடி UPI வசதி'
    ],
    featuresHi: [
      '500m दायरे में अनलिमिटेड लाइव GPS रडार ब्रॉडकास्ट',
      'आसपास के सभी ग्राहकों को प्रोक्सिमिटी घंटी अलर्ट',
      'लाइव स्टॉक काउंटर और तुरंत डिस्काउंट ऑफर्स',
      'दैनिक सब्सक्राइबर डिलीवरी लिस्ट',
      '0% कमीशन पर सीधे UPI भुगतान'
    ]
  },
  {
    id: 'plan-shop-gold-partner',
    title: 'Shopkeeper Gold Partner Suite',
    titleTa: 'கடைக்காரர் தங்க கூட்டாளர் திட்டம்',
    titleHi: 'துகான்தார் கோல்ட் பார்ட்னர் சுயிட்',
    targetRole: 'shop',
    price: 399,
    period: 'monthly',
    badge: 'For Fixed Shops & Stalls',
    savingsText: 'Verified badge, top ranking, and unlimited menus',
    features: [
      'Verified Gold Stall Badge on map & search',
      'Top 1 Placement in your locality category',
      'Unlimited Menu items & photo showcase',
      'Customer Footfall Analytics & review manager',
      'Zero commission on advance pickup orders'
    ],
    featuresTa: [
      'வரைபடத்தில் சரிபார்க்கப்பட்ட தங்க பேட்ஜ்',
      'உங்கள் பகுதியில் முதலிட முன்னுரிமை',
      'வரம்பற்ற மெனு உருப்படிகள் மற்றும் புகைப்படங்கள்',
      'வாடிக்கையாளர் வருகை புள்ளிவிவரங்கள்',
      'முன்பதிவு ஆர்டர்களுக்கு 0% கமிஷன்'
    ],
    featuresHi: [
      'नक्शे पर वेरिफाइड गोल्ड स्टॉल बैज',
      'आपके इलाके में सर्च में नंबर 1 रैंकिंग',
      'अनलिमिटेड मेनू आइटम्स और फोटो गैलरी',
      'दैनिक ग्राहक फुटफॉल एनालिटिक्स',
      'एडवांस पिकअप ऑर्डर्स पर 0% कमीशन'
    ]
  }
];

export const INITIAL_FOOD_SPOTS: FoodSpot[] = [
  {
    id: 'spot-cycle-1',
    name: 'Muthu Anna Cycle Idli & Hot Vadai',
    nameTa: 'முத்து அண்ணா சைக்கிள் இட்லி & சூடான வடை',
    nameHi: 'मुथु अन्ना साइकिल इडली और गरम वड़ा',
    vendorId: 'vendor_muthu',
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
    stockCount: {
      'Steaming Thatte Idlis': 42,
      'Crispy Medu Vadas': 18,
      'Filter Coffee Flask': 15
    },
    activeSubscribersCount: 28,
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
  {
    id: 'spot-mh-1',
    name: 'Aaba Chulivarcha Vada Pav & Masala Chai',
    nameTa: 'ஆபா மராத்தி வடா பாவ் & மசாலா டீ',
    nameHi: 'आबा चुलीवरचा वड़ा पाव और कटिंग चाय',
    vendorId: 'vendor_aaba',
    vendorName: 'Aaba Shinde',
    vendorPhone: '+91 98201 45678',
    category: 'Fixed Street Stall',
    stallType: 'fixed_stall',
    stateRegion: 'maharashtra',
    cityArea: 'Dadar West (Near Portuguese Church), Mumbai',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=70',
    rating: 4.8,
    reviewCount: 520,
    priceRange: '₹',
    topDeal: {
      item: 'Authentic Chulha Vada Pav + Fried Green Chilli',
      price: 18,
      badge: 'Bestseller ₹18'
    },
    distanceMeters: 90,
    walkingTimeSeconds: 70,
    stepsCount: 115,
    bearingDegrees: 180,
    address: 'Corner of Gokhale Road & Ranade Road, Dadar West',
    openingHours: '7:30 AM – 10:30 PM',
    isOpenNow: true,
    isMovingNow: false,
    dietaryTags: ['Pure Veg', 'Freshly Fried', 'Authentic Maharashtrian'],
    paymentTypes: ['Cash', 'UPI / GPay', 'Paytm'],
    description: 'Iconic street food corner in Dadar serving authentic fire-fried potato vadas nestled in soft ladi pav with fiery garlic-peanut chutney and crispy green chillies.',
    secretTip: 'Ask for "Extra Chura" (crunchy gram flour batter drops) sprinkled right inside your pav along with the dry red garlic chutney!',
    stockCount: {
      'Hot Fried Vada Pavs': 65,
      'Kanda Bhajji Plates': 20,
      'Masala Cutting Chai': 30
    },
    activeSubscribersCount: 45,
    menu: [
      { id: 'mh1', name: 'Signature Dadar Chulivarcha Vada Pav', nameTa: 'தாதர் வடா பாவ்', nameHi: 'दादर स्पेशल वड़ा पाव', price: 18, description: 'Golden potato patty in ladi pav with red garlic peanut dry chutney', isBestseller: true, isVegetarian: true },
      { id: 'mh2', name: 'Garama-Garam Kanda Bhajji (Plate)', nameTa: 'வெங்காய பக்கோடா', nameHi: 'गरमा-गरम कांदा भज्जी', price: 30, description: 'Crispy sliced onion fritters served with tangy tamarind chutney', isVegetarian: true },
      { id: 'mh3', name: 'Special Mumbai Masala Cutting Chai', nameTa: 'மும்பை மசாலா டீ', nameHi: 'स्पेशल मुंबई कटिंग चाय', price: 10, description: 'Boiled with fresh crushed ginger, lemongrass, and cardamom', isBestseller: true, isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'spot-cycle-2',
    name: 'Selvam Cycle Podi Dosa & Filter Kaapi',
    nameTa: 'செல்வம் சைக்கிள் பொடி தோசை & பில்டர் காபி',
    nameHi: 'सेल्वम साइकिल पोड़ी डोसा और फिल्टर कॉफी',
    vendorId: 'vendor_selvam',
    vendorName: 'Selvam R.',
    vendorPhone: '+91 94440 98765',
    category: 'Moving Cycle Stall',
    stallType: 'moving_cycle',
    stateRegion: 'tamil_nadu',
    cityArea: 'Mylapore Tank / Temple Street, Chennai',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=300&q=70',
    rating: 4.95,
    reviewCount: 412,
    priceRange: '₹',
    topDeal: {
      item: 'Ghee Podi Thatte Idli (2pcs) + Chutney',
      price: 25,
      badge: 'Mylapore Special ₹25'
    },
    distanceMeters: 110,
    walkingTimeSeconds: 85,
    stepsCount: 140,
    bearingDegrees: 270,
    address: 'Near Kapaleeshwarar Temple Outer Mada Street (Cycling)',
    openingHours: '6:00 AM – 10:30 AM & 5:00 PM – 9:00 PM',
    isOpenNow: true,
    isMovingNow: true,
    speedKmh: 7,
    dietaryTags: ['Pure Veg', 'Ghee Roasted', 'Traditional Mylapore Style'],
    paymentTypes: ['Cash', 'UPI / GPay'],
    description: 'Bicycle mobile tiffin cart serving thatte idlis steeped in homemade gunpowder and pure cow ghee alongside steaming degree filter coffee.',
    secretTip: 'Try the fresh coriander-mint thogayal he serves only between 7:00 AM and 8:30 AM before it runs out!',
    stockCount: {
      'Ghee Podi Thatte Idlis': 38,
      'Filter Coffee Cups': 25
    },
    activeSubscribersCount: 34,
    menu: [
      { id: 's1', name: 'Ghee Podi Thatte Idli', nameTa: 'நெய் பொடி தட்டே இட்லி', nameHi: 'घी पोड़ी थट्टे इडली', price: 25, description: 'Large soft plate idli covered in fragrant spicy podi and pure ghee', isBestseller: true, isVegetarian: true },
      { id: 's2', name: 'Mylapore Degree Filter Coffee', nameTa: 'மயிலாப்பூர் டிகிரி காபி', nameHi: 'मयिलापुर डिग्री फिल्टर कॉफी', price: 15, description: 'Hot foaming milk with concentrated fresh decoction', isBestseller: true, isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  {
    id: 'spot-mh-2',
    name: 'Ganesh Bhelpuri & Sevpuri Chaupati Stall',
    nameTa: 'கணேஷ் பேல்பூரி & சேவ்பூரி ஸ்டால்',
    nameHi: 'गणेश भेलपूरी और सेवपूरी चौपाटी स्टॉल',
    vendorId: 'vendor_ganesh',
    vendorName: 'Ganesh Kadam',
    vendorPhone: '+91 97022 11223',
    category: 'Small Eatery Shop',
    stallType: 'small_shop',
    stateRegion: 'maharashtra',
    cityArea: 'Girgaon Chowpatty / Charni Road, Mumbai',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=300&q=70',
    rating: 4.7,
    reviewCount: 290,
    priceRange: '₹',
    topDeal: {
      item: 'Sukha Bhel + Masala Sev Puri Combo',
      price: 45,
      badge: 'Chowpatty Deal ₹45'
    },
    distanceMeters: 140,
    walkingTimeSeconds: 110,
    stepsCount: 180,
    bearingDegrees: 120,
    address: 'Opposite Charni Road Station Sea-face lane',
    openingHours: '11:00 AM – 11:30 PM',
    isOpenNow: true,
    isMovingNow: false,
    dietaryTags: ['Chaat Special', 'Jain Option Available', 'Tangy & Spicy'],
    paymentTypes: ['Cash', 'UPI / GPay', 'Card'],
    description: 'Crispy puffed rice, tangy tamarind chutney, crushed papdi, spicy garlic dip, and mountain of nylon sev prepared fresh in seconds.',
    secretTip: 'Ask for a "Sukha Puri" (dry crisp puri with potato and spicy masala) complimentary at the end of your chaat!',
    stockCount: {
      'Special Sev Puri Plates': 50,
      'Sukha Bhel Plates': 40
    },
    activeSubscribersCount: 19,
    menu: [
      { id: 'g1', name: 'Mumbai Chowpatty Sev Puri (6pcs)', nameTa: 'சேவ்பூரி', nameHi: 'मुंबई चौपाटी सेवपूरी (6 पीस)', price: 35, description: 'Crisp flat puris topped with potatoes, raw mango, sweet & spicy chutneys and nylon sev', isBestseller: true, isVegetarian: true },
      { id: 'g2', name: 'Geela / Sukha Bhelpuri', nameTa: 'பேல்பூரி', nameHi: 'गीला / सूखा भेलपूरी', price: 30, description: 'Classic Mumbai beach puffed rice snack with roasted peanuts', isVegetarian: true }
    ],
    photos: [
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=85'
    ]
  }
];

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user_customer_demo',
    name: 'Ananya Sharma',
    phone: '9876543210',
    role: 'customer',
    language: 'en',
    stateRegion: 'all',
    avatar: '😋',
    createdAt: new Date().toISOString(),
    activeSubscriptionId: 'sub_demo_1'
  },
  {
    id: 'user_vendor_muthu',
    name: 'Muthu Krishnan',
    phone: '9840123456',
    role: 'moving_stall_owner',
    language: 'ta',
    stateRegion: 'tamil_nadu',
    avatar: '🚲',
    stallId: 'spot-cycle-1',
    businessName: 'Muthu Anna Cycle Idli',
    businessAddress: 'T. Nagar, Chennai (Daily Moving Cart)',
    createdAt: new Date().toISOString(),
    activeSubscriptionId: 'sub_vendor_pro_1'
  },
  {
    id: 'user_shop_aaba',
    name: 'Aaba Shinde',
    phone: '9820145678',
    role: 'shop_owner',
    language: 'hi',
    stateRegion: 'maharashtra',
    avatar: '🏪',
    stallId: 'spot-mh-1',
    businessName: 'Aaba Chulivarcha Vada Pav',
    businessAddress: 'Ranade Road, Dadar West, Mumbai',
    fssaiNumber: 'FSSAI-21524098000123',
    createdAt: new Date().toISOString(),
    activeSubscriptionId: 'sub_shop_gold_1'
  }
];

export const SEED_SUBSCRIPTIONS: UserSubscription[] = [
  {
    id: 'sub_demo_1',
    userId: 'user_customer_demo',
    userName: 'Ananya Sharma',
    userPhone: '9876543210',
    planId: 'plan-customer-idli-pass',
    planTitle: 'Daily Morning Cycle Idli Pass (30 Days)',
    targetRole: 'customer',
    amount: 499,
    status: 'active',
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    deliveriesRemaining: 28,
    paymentMethod: 'upi_gpay',
    paymentId: 'PAY_UPI_983271892',
    selectedSpotId: 'spot-cycle-1',
    selectedSpotName: 'Muthu Anna Cycle Idli & Hot Vadai',
    specialInstructions: 'Ring bell at Gate 3 when passing near 7:45 AM',
    qrPassCode: 'PASS-IDLI-2026-9876'
  },
  {
    id: 'sub_vendor_pro_1',
    userId: 'user_vendor_muthu',
    userName: 'Muthu Krishnan',
    userPhone: '9840123456',
    planId: 'plan-vendor-cycle-pro',
    planTitle: 'Cycle Pro Rider License',
    targetRole: 'vendor',
    amount: 199,
    status: 'active',
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'upi_phonepe',
    paymentId: 'PAY_VND_88192031',
    qrPassCode: 'VND-PRO-CYCLE-001'
  },
  {
    id: 'sub_shop_gold_1',
    userId: 'user_shop_aaba',
    userName: 'Aaba Shinde',
    userPhone: '9820145678',
    planId: 'plan-shop-gold-partner',
    planTitle: 'Shopkeeper Gold Partner Suite',
    targetRole: 'shop',
    amount: 399,
    status: 'active',
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'card',
    paymentId: 'PAY_CARD_5541092',
    qrPassCode: 'SHOP-GOLD-DADAR-01'
  }
];

export const SEED_ORDERS: CustomerOrder[] = [
  {
    id: 'ord_101',
    orderNumber: 'ORD-7821',
    customerId: 'user_customer_demo',
    customerName: 'Ananya Sharma',
    customerPhone: '9876543210',
    spotId: 'spot-cycle-1',
    spotName: 'Muthu Anna Cycle Idli & Hot Vadai',
    items: [
      { itemId: 'm1', name: '4pcs Steaming Hot Idli with Sambhar & Chutney', price: 20, quantity: 2 },
      { itemId: 'm4', name: 'Filter Degree Kaapi', price: 15, quantity: 1 }
    ],
    totalAmount: 55,
    paymentMethod: 'UPI (GPay)',
    status: 'preparing',
    isSubscriptionDelivery: true,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    deliveryNotes: 'Morning Pass delivery at Apartment 3B'
  },
  {
    id: 'ord_102',
    orderNumber: 'ORD-7822',
    customerId: 'user_customer_demo',
    customerName: 'Ananya Sharma',
    customerPhone: '9876543210',
    spotId: 'spot-mh-1',
    spotName: 'Aaba Chulivarcha Vada Pav & Masala Chai',
    items: [
      { itemId: 'mh1', name: 'Signature Dadar Chulivarcha Vada Pav', price: 18, quantity: 2 },
      { itemId: 'mh3', name: 'Special Mumbai Masala Cutting Chai', price: 10, quantity: 2 }
    ],
    totalAmount: 56,
    paymentMethod: 'Cash',
    status: 'delivered',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

// In-Memory & Persistent SQLite Store Bridge
class PersistentDataStore {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
    this.autoSeed();
  }

  // Seed default data if database is empty
  private autoSeed() {
    const existingSpots = this.db.getAllSpots();
    if (existingSpots.length === 0) {
      console.log('🌱 Seeding initial database with food spots, plans, users, and subscriptions...');
      INITIAL_FOOD_SPOTS.forEach((s) => this.db.saveSpot(s));
      SEED_PLANS.forEach((p) => this.db.savePlan(p));
      SEED_USERS.forEach((u) => this.db.saveUser(u));
      SEED_SUBSCRIPTIONS.forEach((sub) => this.db.createSubscription(sub));
      SEED_ORDERS.forEach((o) => this.db.createOrder(o));
      console.log('✅ SQLite Database initialized successfully!');
    }
  }

  // --- Users ---
  getUserById(id: string): UserProfile | undefined {
    return this.db.getUserById(id);
  }

  getUserByPhone(phone: string): UserProfile | undefined {
    return this.db.getUserByPhone(phone);
  }

  saveUser(user: UserProfile): UserProfile {
    return this.db.saveUser(user);
  }

  // --- Spots ---
  getAllSpots(): FoodSpot[] {
    return this.db.getAllSpots();
  }

  getSpotById(id: string): FoodSpot | undefined {
    return this.db.getSpotById(id);
  }

  saveSpot(spot: FoodSpot): FoodSpot {
    return this.db.saveSpot(spot);
  }

  updateSpotLocation(id: string, distanceMeters: number, isMoving: boolean, speedKmh?: number): FoodSpot | undefined {
    return this.db.updateSpotLocation(id, distanceMeters, isMoving, speedKmh);
  }

  updateSpotStock(id: string, stock: { [key: string]: number }): FoodSpot | undefined {
    return this.db.updateSpotStock(id, stock);
  }

  // --- Broadcast ---
  getMovingCycleBroadcasts(): LiveBroadcastState[] {
    return this.db.getMovingCycleBroadcasts();
  }

  triggerBellPing(spotId: string) {
    return this.db.triggerBellPing(spotId);
  }

  // --- Subscriptions ---
  getPlans(): SubscriptionPlan[] {
    return this.db.getPlans();
  }

  getSubscriptionsByUserId(userId: string): UserSubscription[] {
    return this.db.getSubscriptionsByUserId(userId);
  }

  getSubscriptionsByVendorId(vendorId: string): UserSubscription[] {
    return this.db.getSubscriptionsByVendorId(vendorId);
  }

  createSubscription(sub: UserSubscription): UserSubscription {
    return this.db.createSubscription(sub);
  }

  updateSubscriptionStatus(id: string, status: string): UserSubscription | undefined {
    return this.db.updateSubscriptionStatus(id, status);
  }

  // --- Orders ---
  getAllOrders(): CustomerOrder[] {
    return this.db.getAllOrders();
  }

  getOrdersByCustomerId(customerId: string): CustomerOrder[] {
    return this.db.getOrdersByCustomerId(customerId);
  }

  getOrdersBySpotId(spotId: string): CustomerOrder[] {
    return this.db.getOrdersBySpotId(spotId);
  }

  createOrder(order: CustomerOrder): CustomerOrder {
    return this.db.createOrder(order);
  }

  updateOrderStatus(orderId: string, status: string): CustomerOrder | undefined {
    return this.db.updateOrderStatus(orderId, status);
  }

  getStats() {
    return this.db.getStats();
  }
}

export const store = new PersistentDataStore(database);
