import React, { createContext, useContext, useState, ReactNode } from 'react';

const translations: Record<string, Record<string, string>> = {
  // Navigation
  'home': { en: 'Home', mr: 'मुख्यपृष्ठ' },
  'menu': { en: 'Menu', mr: 'मेनू' },
  'plans': { en: 'Plans', mr: 'प्लॅन्स' },
  'profile': { en: 'Profile', mr: 'प्रोफाइल' },
  // Home
  'welcome': { en: 'Welcome to', mr: 'स्वागत आहे' },
  'gurukrupa_mess': { en: 'Gurukrupa Mess', mr: 'गुरुकृपा मेस' },
  'todays_menu': { en: "Today's Menu", mr: 'आजचा मेनू' },
  'order_now': { en: 'Order Now', mr: 'ऑर्डर करा' },
  'single_tiffin': { en: 'Single Tiffin', mr: 'एक डबा' },
  'ghar_ka_swad': { en: 'Taste of Home', mr: 'घरच्या जेवणाची चव' },
  'daily_items': { en: 'Daily Items', mr: 'रोजचे पदार्थ' },
  'special_today': { en: "Today's Special", mr: 'आजचे स्पेशल' },
  // Menu
  'weekly_menu': { en: 'Weekly Menu', mr: 'साप्ताहिक मेनू' },
  'monday': { en: 'Monday', mr: 'सोमवार' },
  'tuesday': { en: 'Tuesday', mr: 'मंगळवार' },
  'wednesday': { en: 'Wednesday', mr: 'बुधवार' },
  'thursday': { en: 'Thursday', mr: 'गुरुवार' },
  'friday': { en: 'Friday', mr: 'शुक्रवार' },
  'saturday': { en: 'Saturday', mr: 'शनिवार' },
  'sunday': { en: 'Sunday', mr: 'रविवार' },
  // Orders
  'order_history': { en: 'Order History', mr: 'ऑर्डर इतिहास' },
  'no_orders': { en: 'No orders yet', mr: 'अजून ऑर्डर नाही' },
  'pending': { en: 'Pending', mr: 'प्रलंबित' },
  'preparing': { en: 'Preparing', mr: 'तयार होत आहे' },
  'out_for_delivery': { en: 'Out for Delivery', mr: 'डिलिव्हरीसाठी निघाले' },
  'delivered': { en: 'Delivered', mr: 'डिलिव्हर झाले' },
  'cancelled': { en: 'Cancelled', mr: 'रद्द' },
  // Plans
  'subscription_plans': { en: 'Subscription Plans', mr: 'सदस्यता प्लॅन्स' },
  'subscribe': { en: 'Subscribe', mr: 'सदस्यता घ्या' },
  'days': { en: 'days', mr: 'दिवस' },
  'meals_day': { en: 'meals/day', mr: 'जेवण/दिवस' },
  'per_month': { en: '/month', mr: '/महिना' },
  'active': { en: 'Active', mr: 'सक्रिय' },
  // Auth
  'login': { en: 'Login', mr: 'लॉगिन' },
  'register': { en: 'Register', mr: 'नोंदणी' },
  'email': { en: 'Email', mr: 'ईमेल' },
  'password': { en: 'Password', mr: 'पासवर्ड' },
  'name': { en: 'Full Name', mr: 'पूर्ण नाव' },
  'phone': { en: 'Phone Number', mr: 'फोन नंबर' },
  'address': { en: 'Delivery Address', mr: 'डिलिव्हरी पत्ता' },
  'dont_have_account': { en: "Don't have an account?", mr: 'खाते नाही?' },
  'already_have_account': { en: 'Already have an account?', mr: 'खाते आहे?' },
  // Profile
  'logout': { en: 'Logout', mr: 'बाहेर पडा' },
  'edit_profile': { en: 'Edit Profile', mr: 'प्रोफाइल बदला' },
  'save': { en: 'Save', mr: 'जतन करा' },
  'language': { en: 'Language', mr: 'भाषा' },
  'my_orders': { en: 'My Orders', mr: 'माझ्या ऑर्डर्स' },
  'my_subscriptions': { en: 'My Subscriptions', mr: 'माझ्या सदस्यता' },
  'support': { en: 'Support', mr: 'सहाय्य' },
  'admin_panel': { en: 'Admin Panel', mr: 'ॲडमिन पॅनेल' },
  // Support
  'contact_us': { en: 'Contact Us', mr: 'संपर्क करा' },
  'whatsapp_us': { en: 'WhatsApp Us', mr: 'व्हॉट्सॲप करा' },
  'call_us': { en: 'Call Us', mr: 'कॉल करा' },
  'faq': { en: 'FAQ', mr: 'वारंवार विचारले जाणारे प्रश्न' },
  // Admin
  'dashboard': { en: 'Dashboard', mr: 'डॅशबोर्ड' },
  'manage_menu': { en: 'Manage Menu', mr: 'मेनू व्यवस्थापन' },
  'manage_orders': { en: 'Manage Orders', mr: 'ऑर्डर व्यवस्थापन' },
  'customers': { en: 'Customers', mr: 'ग्राहक' },
  'total_orders': { en: 'Total Orders', mr: 'एकूण ऑर्डर्स' },
  'total_revenue': { en: 'Total Revenue', mr: 'एकूण उत्पन्न' },
  'today_orders': { en: "Today's Orders", mr: 'आजच्या ऑर्डर्स' },
  // General
  'loading': { en: 'Loading...', mr: 'लोड होत आहे...' },
  'error': { en: 'Something went wrong', mr: 'काहीतरी चूक झाली' },
  'retry': { en: 'Retry', mr: 'पुन्हा प्रयत्न करा' },
  'cancel': { en: 'Cancel', mr: 'रद्द करा' },
  'confirm': { en: 'Confirm', mr: 'पुष्टी करा' },
  'success': { en: 'Success!', mr: 'यशस्वी!' },
  'payment_success': { en: 'Payment Successful', mr: 'पेमेंट यशस्वी' },
  'place_order': { en: 'Place Order', mr: 'ऑर्डर द्या' },
  'pay': { en: 'Pay', mr: 'पैसे द्या' },
  // Dine-in
  'dine_in': { en: 'Dine In', mr: 'मेसमध्ये जेवा' },
  'dine_in_title': { en: 'Dine-In Thali', mr: 'मेसमधील थाळी' },
  'unlimited_food': { en: 'Unlimited Food', mr: 'अनलिमिटेड जेवण' },
  'unlimited_desc': { en: 'Eat as much as you want!', mr: 'मनसोक्त जेवा!' },
  'unlimited_includes': { en: 'Unlimited Rice, Roti, Dal, Sabzi, Salad & more', mr: 'अनलिमिटेड भात, चपाती, डाळ, भाजी, सॅलड आणि बरेच काही' },
  'walk_in': { en: 'Walk-in, No booking needed', mr: 'थेट या, बुकिंगची गरज नाही' },
  'dine_in_note': { en: 'Visit our mess and enjoy unlimited home-style food', mr: 'आमच्या मेसला भेट द्या आणि अनलिमिटेड घरगुती जेवणाचा आनंद घ्या' },
  'delivery': { en: 'Delivery', mr: 'डिलिव्हरी' },
  'eat_at_mess': { en: 'Eat at Mess', mr: 'मेसमध्ये खा' },
  'dine_in_order': { en: 'Dine-In Order', mr: 'मेस ऑर्डर' },
  'guests': { en: 'Guests', mr: 'पाहुणे' },
};

type LangContextType = {
  lang: 'en' | 'mr';
  setLang: (l: 'en' | 'mr') => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LangContextType>({} as LangContextType);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'en' | 'mr'>('en');
  const t = (key: string) => translations[key]?.[lang] || key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
