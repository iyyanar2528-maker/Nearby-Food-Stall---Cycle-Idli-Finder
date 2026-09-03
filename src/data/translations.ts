import { LanguageCode } from '../types';

export interface TranslationDict {
  appName: string;
  appSubtitle: string;
  loginTitle: string;
  loginSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  roleLabel: string;
  roleCustomer: string;
  roleMovingVendor: string;
  roleShopOwner: string;
  selectLanguage: string;
  stateLabel: string;
  stateAll: string;
  stateMH: string;
  stateTN: string;
  otpLabel: string;
  otpPlaceholder: string;
  otpHelper: string;
  getOtpBtn: string;
  verifyLoginBtn: string;
  logoutBtn: string;
  welcomeBack: string;
  nearBySpots: string;
  movingStallsAlert: string;
  movingCycleTitle: string;
  movingCycleSubtitle: string;
  radiusLabel: string;
  priceSortLabel: string;
  sortLowHigh: string;
  sortHighLow: string;
  sortNearest: string;
  dealsUnder20: string;
  dealsUnder40: string;
  dealsUnder70: string;
  dealsUnder100: string;
  allDeals: string;
  walkingRoute: string;
  walkNow: string;
  viewDeck: string;
  viewGrid: string;
  viewRadar: string;
  savedSpots: string;
  surpriseMe: string;
  vendorHub: string;
  vendorBroadcast: string;
  cycleMovingLive: string;
  updateLocation: string;
  stallStatusOpen: string;
  stallStatusClosed: string;
  alertTitle: string;
  alertCyclePassing: string;
  orderNow: string;
  callVendor: string;
  stepsAway: string;
  secondsWalk: string;
  proTip: string;
  fullMenu: string;
  openingHours: string;
  paymentMode: string;
  avgWalkTime: string;
  pricesInRupees: string;
  searchPlaceholder: string;
  addStallTitle: string;
  // Subscriptions & Portals
  subscriptionsTitle: string;
  subscriptionsSubtitle: string;
  customerPassesTab: string;
  vendorPlansTab: string;
  myActivePasses: string;
  subscribeNowBtn: string;
  subscribedBadge: string;
  pausePassBtn: string;
  resumePassBtn: string;
  payWithUpi: string;
  payWithCard: string;
  payWithCash: string;
  checkoutTitle: string;
  ringProximityBell: string;
  liveStockTracker: string;
  shopManagementHub: string;
  cycleRadarHub: string;
  demoLoginBtn: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  en: {
    appName: "50-150m Street Eats",
    appSubtitle: "Maharashtra & Tamil Nadu Ultra-Local Food Radar",
    loginTitle: "Multi-Role Food Radar Login",
    loginSubtitle: "Sign in as Foodie Customer, Cycle Idli Vendor, or Shop Owner",
    nameLabel: "Your Name",
    namePlaceholder: "e.g. Ramesh Kumar / Ananya",
    phoneLabel: "Mobile Number",
    phonePlaceholder: "10-digit mobile number",
    roleLabel: "Select Your Account Role",
    roleCustomer: "😋 Hungry Customer (Find Food & Tiffin Passes)",
    roleMovingVendor: "🚲 Moving Cycle Idli / Cart (Live GPS Radar)",
    roleShopOwner: "🏪 Fixed Shop / Handcart Owner (Menu & Orders)",
    selectLanguage: "Choose Language",
    stateLabel: "State / Region",
    stateAll: "All Regions",
    stateMH: "Maharashtra (Mumbai / Pune)",
    stateTN: "Tamil Nadu (Chennai / Madurai)",
    otpLabel: "Enter 6-Digit OTP",
    otpPlaceholder: "6-digit code (e.g. 123456)",
    otpHelper: "Test OTP auto-fills or enter 123456",
    getOtpBtn: "Send Verification OTP",
    verifyLoginBtn: "Verify & Enter Food Radar",
    logoutBtn: "Logout",
    welcomeBack: "Vanakkam / Namaskar",
    nearBySpots: "Local Stalls Nearby",
    movingStallsAlert: "Live Moving Cycle Food Cart Alert",
    movingCycleTitle: "Moving Idli/Chai Cycle Alert!",
    movingCycleSubtitle: "Fresh hot food is passing right by your street within 100-150m!",
    radiusLabel: "Radius",
    priceSortLabel: "Price Filter",
    sortLowHigh: "Price: Low to High (₹)",
    sortHighLow: "Price: High to Low (₹)",
    sortNearest: "Nearest Distance",
    dealsUnder20: "Under ₹20",
    dealsUnder40: "Under ₹40",
    dealsUnder70: "Under ₹70",
    dealsUnder100: "Under ₹100",
    allDeals: "All Budget Deals",
    walkingRoute: "Live Walking Navigation",
    walkNow: "Walk Now",
    viewDeck: "3D Deck",
    viewGrid: "3D Grid",
    viewRadar: "Radar",
    savedSpots: "Saved Pockets",
    surpriseMe: "Surprise Pick",
    vendorHub: "Vendor Stall Portal",
    vendorBroadcast: "Broadcast Live Cycle Location",
    cycleMovingLive: "Cycle is On The Move (100-150m alerts active)",
    updateLocation: "Update Live Coordinates",
    stallStatusOpen: "Stall Open & Selling",
    stallStatusClosed: "Stall Closed",
    alertTitle: "🔔 Moving Stall Near You!",
    alertCyclePassing: "is passing within ~120m of your location. Want fresh hot food right now?",
    orderNow: "Call / Locate Stall",
    callVendor: "Call Vendor",
    stepsAway: "steps away",
    secondsWalk: "seconds walk",
    proTip: "Secret Local Hack",
    fullMenu: "Cheap Budget Menu",
    openingHours: "Timings",
    paymentMode: "Payment Accepted",
    avgWalkTime: "Avg. walk: ~60-90s (50-150m radius)",
    pricesInRupees: "All prices in Indian Rupees (₹)",
    searchPlaceholder: "Search Vada Pav, Idli, Dosa, Poha, Misal...",
    addStallTitle: "Register My Stall / Cycle Cart",
    subscriptionsTitle: "Meal Passes & Vendor Subscriptions",
    subscriptionsSubtitle: "Save money on daily breakfast passes or supercharge your food stall with Pro Radar",
    customerPassesTab: "😋 Customer Daily Passes",
    vendorPlansTab: "🚀 Stall & Shop SaaS Plans",
    myActivePasses: "My Active Passes",
    subscribeNowBtn: "Subscribe & Activate Pass",
    subscribedBadge: "Active Pass Holder",
    pausePassBtn: "Pause Pass",
    resumePassBtn: "Resume Pass",
    payWithUpi: "Instant UPI (GPay / PhonePe / Paytm)",
    payWithCard: "Credit / Debit Card",
    payWithCash: "Pay Cash at Stall",
    checkoutTitle: "Complete Secure Payment",
    ringProximityBell: "Ring Proximity Bell (Alert Nearby Foodies)",
    liveStockTracker: "Live Steaming Stock Tracker",
    shopManagementHub: "Shopkeeper Management Hub",
    cycleRadarHub: "Cycle Idli Radar Broadcaster",
    demoLoginBtn: "Quick 1-Click Demo Login"
  },
  ta: {
    appName: "50-150மீ தெருவோர உணவு ரேடார்",
    appSubtitle: "தமிழ்நாடு மற்றும் மகாராஷ்டிரா உள்ளூர் உணவு தேடல்",
    loginTitle: "பயனர் உள்நுழைவு போர்டல்",
    loginSubtitle: "வாடிக்கையாளர், சைக்கிள் இட்லி கடைக்காரர் அல்லது உணவக உரிமையாளராக நுழைக",
    nameLabel: "உங்கள் பெயர்",
    namePlaceholder: "எ.கா. ரமேஷ் / பிரியா",
    phoneLabel: "மொபைல் எண்",
    phonePlaceholder: "10 இலக்க மொபைல் எண்",
    roleLabel: "உங்கள் கணக்கு வகை",
    roleCustomer: "😋 வாடிக்கையாளர் (உணவு & தினசரி டிபன் பாஸ்)",
    roleMovingVendor: "🚲 நகரும் சைக்கிள் இட்லி வண்டி (நேரடி GPS ரேடார்)",
    roleShopOwner: "🏪 நிரந்தர கடை / தள்ளுவண்டி (மெனு & ஆர்டர்கள்)",
    selectLanguage: "மொழியை தேர்வு செய்க",
    stateLabel: "மாநிலம் / பகுதி",
    stateAll: "அனைத்து பகுதிகள்",
    stateMH: "மகாராஷ்டிரா (மும்பை / புனே)",
    stateTN: "தமிழ்நாடு (சென்னை / மதுரை / கோவை)",
    otpLabel: "6 இலக்க OTP உள்ளிடவும்",
    otpPlaceholder: "6 இலக்க குறியீடு (123456)",
    otpHelper: "சோதனை OTP தானாக நிரப்பப்படும் அல்லது 123456 உள்ளிடவும்",
    getOtpBtn: "OTP பெறுக",
    verifyLoginBtn: "சரிபார்த்து நுழையவும்",
    logoutBtn: "வெளியேறு",
    welcomeBack: "வணக்கம்! நல்வரவு",
    nearBySpots: "அருகிலுள்ள உள்ளூர் கடைகள்",
    movingStallsAlert: "நகரும் சைக்கிள் இட்லி / டீ கடை எச்சரிக்கை",
    movingCycleTitle: "நகரும் சைக்கிள் இட்லி கடை அருகில் உள்ளது!",
    movingCycleSubtitle: "சூடான இட்லி, டீ சைக்கிள் உங்கள் தெருவில் 100-150 மீட்டருக்குள் வருகிறது!",
    radiusLabel: "சுற்றளவு",
    priceSortLabel: "விலை வரிசை",
    sortLowHigh: "குறைந்த விலை முதல் அதிக விலை வரை (₹)",
    sortHighLow: "அதிக விலை முதல் குறைந்த விலை வரை (₹)",
    sortNearest: "மிக அருகில்",
    dealsUnder20: "₹20க்கு கீழ்",
    dealsUnder40: "₹40க்கு கீழ்",
    dealsUnder70: "₹70க்கு கீழ்",
    dealsUnder100: "₹100க்கு கீழ்",
    allDeals: "அனைத்து விலைகளும்",
    walkingRoute: "நேரடி நடைபாதை வழிகாட்டல்",
    walkNow: "இப்போதே செல்லவும்",
    viewDeck: "3D டெக்",
    viewGrid: "3D கட்டம்",
    viewRadar: "ரேடார்",
    savedSpots: "சேமிக்கப்பட்டவை",
    surpriseMe: "திடீர் தேர்வு",
    vendorHub: "வியாபாரி போர்டல்",
    vendorBroadcast: "சைக்கிள் நேரடி இருப்பிடத்தை பகிரவும்",
    cycleMovingLive: "சைக்கிள் நகர்ந்து கொண்டிருக்கிறது (100-150மீ எச்சரிக்கை செயலில் உள்ளது)",
    updateLocation: "இருப்பிடத்தை புதுப்பிக்கவும்",
    stallStatusOpen: "கடை திறந்துள்ளது",
    stallStatusClosed: "கடை மூடப்பட்டுள்ளது",
    alertTitle: "🔔 நகரும் உணவு கடை அருகில்!",
    alertCyclePassing: "உங்கள் இடத்திற்கு 120மீ அருகில் கடந்து செல்கிறது. சூடான உணவு வேண்டுமா?",
    orderNow: "கடைக்காரரை தொடர்பு கொள்க",
    callVendor: "அழைக்க",
    stepsAway: "நடக்கும் அடிகள்",
    secondsWalk: "வினாடி நடை",
    proTip: "உள்ளூர் ரகசிய குறிப்பு",
    fullMenu: "குறைந்த விலை உணவு பட்டியல்",
    openingHours: "நேரம்",
    paymentMode: "பணம் செலுத்தும் முறை (UPI / Cash)",
    avgWalkTime: "சராசரி நடை: 60-90 வினாடிகள் (50-150மீ)",
    pricesInRupees: "அனைத்து விலைகளும் இந்திய ரூபாயில் (₹)",
    searchPlaceholder: "இட்லி, தோசை, வடை, பூரி, டீ தேடவும்...",
    addStallTitle: "என் கடையை பதிவு செய்",
    subscriptionsTitle: "டிபன் பாஸ்கள் & சந்தா திட்டங்கள்",
    subscriptionsSubtitle: "தினசரி காலை உணவில் பணத்தை சேமிக்கவும் அல்லது உங்கள் கடையை முன்னிலைப்படுத்தவும்",
    customerPassesTab: "😋 வாடிக்கையாளர் தினசரி பாஸ்கள்",
    vendorPlansTab: "🚀 வியாபாரி ப்ரோ திட்டங்கள்",
    myActivePasses: "என் பாஸ்கள்",
    subscribeNowBtn: "பாஸ் வாங்குக",
    subscribedBadge: "செயலில் உள்ள பாஸ்",
    pausePassBtn: "இடைநிறுத்து",
    resumePassBtn: "தொடர்க",
    payWithUpi: "உடனடி UPI (GPay / PhonePe / Paytm)",
    payWithCard: "டெபிட் / கிரெடிட் கார்டு",
    payWithCash: "கடையில் பணம் செலுத்துக",
    checkoutTitle: "பணம் செலுத்துதல்",
    ringProximityBell: "எச்சரிக்கை மணி ஒலிக்கவும் (150மீ எச்சரிக்கை)",
    liveStockTracker: "சூடான உணவு இருப்பு கண்காணிப்பான்",
    shopManagementHub: "கடை மேலாண்மை போர்டல்",
    cycleRadarHub: "சைக்கிள் இட்லி ரேடார் ஒலிபரப்பு",
    demoLoginBtn: "1-கிளிக் சோதனை உள்நுழைவு"
  },
  hi: {
    appName: "50-150m स्ट्रीट फूड रडार",
    appSubtitle: "महाराष्ट्र और तमिलनाडु लोकल फूड फाइंडर",
    loginTitle: "मल्टी-रोल फूड रडार लॉगिन",
    loginSubtitle: "ग्राहक, साइकिल इडली वेंडर या दुकान मालिक के रूप में लॉगिन करें",
    nameLabel: "आपका नाम",
    namePlaceholder: "उदा. राहुल / प्रिया कन्नौजिया",
    phoneLabel: "मोबाइल नंबर",
    phonePlaceholder: "10 अंकों का मोबाइल नंबर",
    roleLabel: "अपना रोल चुनें",
    roleCustomer: "😋 भूखा ग्राहक (खाना और टिफिन पास खोजें)",
    roleMovingVendor: "🚲 चलती साइकिल इडली / ठेला (लाइव GPS रडार)",
    roleShopOwner: "🏪 पक्की दुकान / होटल मालिक (मेनू और ऑर्डर्स)",
    selectLanguage: "भाषा चुनें",
    stateLabel: "राज्य / क्षेत्र",
    stateAll: "सभी क्षेत्र",
    stateMH: "महाराष्ट्र (मुंबई / पुणे / नागपुर)",
    stateTN: "तमिलनाडु (चेन्नई / मदुरै)",
    otpLabel: "6 अंकों का OTP दर्ज करें",
    otpPlaceholder: "6 अंकों का कोड (123456)",
    otpHelper: "टेस्ट OTP अपने-आप भरा जाएगा या 123456 दर्ज करें",
    getOtpBtn: "OTP कोड भेजें",
    verifyLoginBtn: "सत्यापित करें और रडार खोलें",
    logoutBtn: "लॉगआउट",
    welcomeBack: "नमस्ते / स्वागत है",
    nearBySpots: "पास के लोकल फूड स्टॉल",
    movingStallsAlert: "चलती साइकिल इडली / चाय ठेला अलर्ट",
    movingCycleTitle: "चलती साइकिल इडली वाला पास में है!",
    movingCycleSubtitle: "गरमा-गरम ताजा नाश्ता आपके पास 100-150 मीटर के अंदर घूम रहा है!",
    radiusLabel: "दूरी",
    priceSortLabel: "कीमत अनुसार",
    sortLowHigh: "कम कीमत से अधिक कीमत (₹)",
    sortHighLow: "अधिक कीमत से कम कीमत (₹)",
    sortNearest: "सबसे नजदीक",
    dealsUnder20: "₹20 से कम",
    dealsUnder40: "₹40 से कम",
    dealsUnder70: "₹70 से कम",
    dealsUnder100: "₹100 से कम",
    allDeals: "सभी बजट डील्स",
    walkingRoute: "पैदल रास्ता नेविगेशन",
    walkNow: "अभी चलें",
    viewDeck: "3D डेक",
    viewGrid: "3D ग्रिड",
    viewRadar: "रडार",
    savedSpots: "सेव किए स्टॉल",
    surpriseMe: "सरप्राइज डिश",
    vendorHub: "दुकानदार पोर्टल",
    vendorBroadcast: "साइकिल लाइव लोकेशन ब्रॉडकास्ट करें",
    cycleMovingLive: "साइकिल चल रही है (100-150m अलर्ट एक्टिव)",
    updateLocation: "लोकेशन अपडेट करें",
    stallStatusOpen: "दुकान खुली है",
    stallStatusClosed: "दुकान बंद है",
    alertTitle: "🔔 साइकिल स्टॉल आपके पास से गुजर रहा है!",
    alertCyclePassing: "आपके पास ~120 मीटर की दूरी पर है। क्या आपको गरमा-गरम खाना चाहिए?",
    orderNow: "दुकानदार को कॉल करें",
    callVendor: "कॉल करें",
    stepsAway: "कदम दूर",
    secondsWalk: "सेकंड पैदल",
    proTip: "लोकल सीक्रेट टिप",
    fullMenu: "सस्ता मेनू कार्ड",
    openingHours: "खुलने का समय",
    paymentMode: "भुगतान का प्रकार (UPI / Cash)",
    avgWalkTime: "औसत पैदल समय: 60-90 सेकंड (50-150m)",
    pricesInRupees: "सभी कीमतें भारतीय रुपये (₹) में",
    searchPlaceholder: "वड़ा पाव, इडली, पोहा, मिसाल, डोसा खोजें...",
    addStallTitle: "अपना स्टॉल / साइकिल रजिस्टर करें",
    subscriptionsTitle: "टिफिन पास और वेंडर सब्सक्रिप्शन",
    subscriptionsSubtitle: "रोजाना नाश्ते के पास से पैसे बचाएं या प्रो रडार से अपनी दुकान को नंबर 1 बनाएं",
    customerPassesTab: "😋 ग्राहक दैनिक नाश्ता पास",
    vendorPlansTab: "🚀 वेंडर व दुकानदार प्रो प्लान",
    myActivePasses: "मेरे एक्टिव पास",
    subscribeNowBtn: "पास एक्टिवेट करें",
    subscribedBadge: "एक्टिव पास धारक",
    pausePassBtn: "पास रोकें",
    resumePassBtn: "पास चालू करें",
    payWithUpi: "तुरंत UPI (GPay / PhonePe / Paytm)",
    payWithCard: "डेबिट / क्रेडिट कार्ड",
    payWithCash: "स्टॉल पर नकद भुगतान",
    checkoutTitle: "सुरक्षित भुगतान",
    ringProximityBell: "घंटी बजाएं (150m दायरे में अलर्ट भेजें)",
    liveStockTracker: "ताजा गर्म स्टॉक ट्रैकर",
    shopManagementHub: "दुकानदार मैनेजमेंट हब",
    cycleRadarHub: "साइकिल इडली रडार ब्रॉडकास्टर",
    demoLoginBtn: "1-क्लिक डेमो लॉगिन"
  }
};
