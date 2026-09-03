import { SubscriptionPlan } from '../types';

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
