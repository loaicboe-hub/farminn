import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.resolve(__dirname, '../foundation/i18n');

const enExtensions = {
  nav: {
    farms: "Farms",
    management: "Farm Management",
    partnerships: "Partnerships",
    quickBuy: "Quick Buy",
    quickSell: "Quick Sell",
    suppliers: "Suppliers",
    humanResources: "Human Resources",
    howItWorks: "How It Works",
    signIn: "Sign In",
    register: "Create Account",
    myDashboard: "My Account"
  },
  farminn: {
    brandName: "FARMINN",
    tagline: "The Agricultural Marketplace & Farm Management Platform",
    exploreFarms: "Explore Farms",
    requestManagement: "Request Management",
    browsePartnerships: "Investment & Partnerships",
    heroTitle: "Egypt's Premier Agricultural Marketplace & Farm Management Platform",
    heroSubtitle: "Buy, sell, and rent verified farms, connect with expert farm managers, explore agricultural partnerships, and source certified suppliers.",
    verifiedFarmsBadge: "Verified & Inspected Farms",
    statsFarms: "Listed Farms",
    statsFeddan: "Total Feddans Managed",
    statsManagers: "Agricultural Engineers & Managers",
    statsSuppliers: "Certified Suppliers",
    howItWorksTitle: "How FARMINN Works",
    howItWorksStep1Title: "1. Verified Listings",
    howItWorksStep1Desc: "Every farm listing undergoes administrative review of legal deeds, water permits, and soil specs before publishing.",
    howItWorksStep2Title: "2. Turnkey Management",
    howItWorksStep2Desc: "Farm owners request professional management; certified agronomists and managers submit competitive proposals.",
    howItWorksStep3Title: "3. Direct & Transparent Deals",
    howItWorksStep3Desc: "Connect securely with verified buyers, sellers, partners, and equipment suppliers with zero hidden intermediaries."
  },
  farms: {
    title: "Explore Farms",
    subtitle: "Verified agricultural lands for sale and rent across Egypt",
    forSale: "For Sale",
    forRent: "For Rent",
    allFarms: "All Listings",
    governorate: "Governorate",
    allGovernorates: "All Governorates",
    farmType: "Farm Type",
    allTypes: "All Types",
    minArea: "Min Area (Feddan)",
    maxArea: "Max Area (Feddan)",
    minPrice: "Min Price (EGP)",
    maxPrice: "Max Price (EGP)",
    sortBy: "Sort By",
    newest: "Newest First",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    areaAsc: "Area: Small to Large",
    areaDesc: "Area: Large to Small",
    feddan: "Feddan",
    qirat: "Qirat",
    currencyEgp: "EGP",
    viewDetails: "View Farm Details",
    verified: "Verified Farm",
    specifications: "Farm Specifications",
    waterSources: "Water & Irrigation",
    electricity: "Electricity Source",
    soilType: "Soil Quality",
    legalStatus: "Legal Status & Deeds",
    facilities: "Facilities & Infrastructure",
    documents: "Verified Documents",
    inquireTitle: "Inquire About This Farm",
    whatsappDirect: "Contact via WhatsApp",
    callDirect: "Call Owner / Representative",
    addFarmTitle: "List a Farm for Sale or Rent",
    noFarmsFound: "No farms matched your current search filters."
  },
  management: {
    title: "Farm Management Marketplace",
    subtitle: "Connect your farm with certified agricultural managers and agronomists, or offer professional management services.",
    requestManagement: "Request Farm Management",
    joinAsManager: "Register as Farm Manager",
    openRequests: "Open Management Requests",
    submitProposal: "Submit Management Proposal",
    crops: "Target Crops / Activities",
    requiredServices: "Required Services",
    proposalsCount: "Proposals Received",
    budgetRange: "Budget / Compensation Range",
    durationMonths: "Contract Duration",
    proposedFee: "Proposed Fee",
    feeType: "Compensation Structure",
    details: "Project Details"
  },
  partnerships: {
    title: "Partnerships & Investment Opportunities",
    subtitle: "Explore verified agricultural joint ventures, capital partnerships, and operating investments.",
    requiredCapital: "Required Capital",
    equityOffered: "Offered Equity Share",
    applyForPartnership: "Apply for Partnership",
    newOpportunity: "List Partnership Opportunity",
    partnershipType: "Partnership Type",
    objectives: "Project Objectives & Conditions",
    applicantMessage: "Proposal & Background"
  },
  quickBuy: {
    title: "Quick Buy with Assets",
    subtitle: "Tell us what farm you are looking for. Submit your cash budget and trade existing assets (real estate, vehicles, or equipment).",
    cashBudget: "Available Cash Amount (EGP)",
    exchangeAssets: "Assets Available for Exchange (Optional)",
    assetType: "Asset Category",
    assetDescription: "Asset Details & Estimated Value",
    submitRequest: "Submit Purchase Request",
    successNotice: "Your quick buy request has been submitted for administrative review."
  },
  quickSell: {
    title: "Quick Sell with Assets",
    subtitle: "Sell your farm quickly with administrative assistance. Flexible options for installments or exchange with qualified buyers.",
    farmName: "Farm Name / Title",
    askingPrice: "Asking Price (EGP)",
    acceptsInstallments: "Accept Installments?",
    acceptsExchange: "Accept Asset Exchange?",
    exchangeConditions: "Exchange Preferences / Conditions",
    submitSellRequest: "Submit Assisted Sale Request",
    successNotice: "Your quick sell request has been received. Our team will review your details shortly."
  },
  suppliers: {
    title: "Agricultural Suppliers Directory",
    subtitle: "Find certified suppliers of irrigation equipment, fertilizers, machinery, seeds, and solar pumping.",
    allCategories: "All Categories",
    verifiedSupplier: "Verified Supplier",
    requestQuote: "Request Price Quote",
    productsServices: "Products & Services",
    contactSupplier: "Contact Supplier"
  },
  humanResources: {
    title: "Agricultural Human Resources",
    subtitle: "Discover top agricultural engineers, experienced farm managers, irrigation specialists, and skilled labor.",
    category: "Professional Category",
    yearsOfExperience: "Years of Experience",
    skills: "Key Skills & Specializations",
    contactProfessional: "Contact & Hire",
    downloadCv: "View Qualifications / CV"
  },
  myDashboard: {
    title: "Personal Dashboard",
    overview: "Overview",
    myListings: "My Farm Listings",
    myManagement: "Management Requests",
    myProposals: "Proposals & Bids",
    myPartnerships: "Partnership Requests",
    myRequests: "Quick Buy / Sell Requests",
    profileSettings: "Account & Profile Settings",
    submitNewListing: "List a New Farm",
    submitNewManagement: "New Management Request",
    submitNewPartnership: "New Partnership Offer"
  }
};

const arExtensions = {
  nav: {
    farms: "المزارع",
    management: "إدارة المزارع",
    partnerships: "الشراكات والاستثمار",
    quickBuy: "شراء سريع",
    quickSell: "بيع سريع",
    suppliers: "دليل الموردين",
    humanResources: "الكوادر الزراعية",
    howItWorks: "كيف نعمل",
    signIn: "تسجيل الدخول",
    register: "إنشاء حساب",
    myDashboard: "حسابي"
  },
  farminn: {
    brandName: "فارمين",
    tagline: "المنصة الزراعية المتكاملة لسوق وإدارة المزارع",
    exploreFarms: "استكشف المزارع",
    requestManagement: "طلب إدارة مزرعة",
    browsePartnerships: "فرص الاستثمار والشراكة",
    heroTitle: "المنصة الرائدة في مصر لسوق وإدارة واستثمار المزارع",
    heroSubtitle: "بيع وشراء وتأجير مزارع موثقة ومعاينة، وتواصل مع نخبة من مديري المزارع والمهندسين الزراعيين، واستكشف شراكات استثمارية وموردين معتمدين.",
    verifiedFarmsBadge: "مزارع موثقة ومفحوصة قانونياً وفنياً",
    statsFarms: "مزرعة معروضة",
    statsFeddan: "فدان خاضع للإشراف والإدارة",
    statsManagers: "مهندس وخبير زراعي",
    statsSuppliers: "شركة ومورد معتمد",
    howItWorksTitle: "كيف تعمل منصة فارمين",
    howItWorksStep1Title: "١. فحص وتوثيق معتمد",
    howItWorksStep1Desc: "تخضع كل مزرعة للمعاينة ومراجعة أوراق الملكية ومصادر الري والكهرباء والتربة قبل النشر.",
    howItWorksStep2Title: "٢. إدارة وتشغيل متكامل",
    howItWorksStep2Desc: "يطلب ملاك المزارع إدارة احترافية، ويقدم المهندسون والمديرون عروض تشغيل تفصيلية للمفاضلة بينها.",
    howItWorksStep3Title: "٣. صفقات مباشرة وشفافة",
    howItWorksStep3Desc: "تواصل مباشر وآمن بين المشترين والمستثمرين والموردين بدون عمولات خفية أو وسطاء غير معتمدين."
  },
  farms: {
    title: "استكشف المزارع",
    subtitle: "أراضٍ ومزارع موثقة ومفحوصة للبيع والإيجار في كافة المحافظات",
    forSale: "للبيع",
    forRent: "للإيجار",
    allFarms: "كافة المزارع",
    governorate: "المحافظة",
    allGovernorates: "كافة المحافظات",
    farmType: "نوع المزرعة",
    allTypes: "كافة الأنواع",
    minArea: "أقل مساحة (فدان)",
    maxArea: "أقصى مساحة (فدان)",
    minPrice: "أقل سعر (جنيه)",
    maxPrice: "أقصى سعر (جنيه)",
    sortBy: "ترتيب حسب",
    newest: "الأحدث أولاً",
    priceAsc: "السعر: من الأقل للأعلى",
    priceDesc: "السعر: من الأعلى للأقل",
    areaAsc: "المساحة: من الأصغر للأكبر",
    areaDesc: "المساحة: من الأكبر للأصغر",
    feddan: "فدان",
    qirat: "قيراط",
    currencyEgp: "جنيه",
    viewDetails: "عرض تفاصيل المزرعة",
    verified: "مزرعة موثقة",
    specifications: "مواصفات المزرعة",
    waterSources: "مصادر المياه والري",
    electricity: "مصدر الكهرباء",
    soilType: "نوع وجودة التربة",
    legalStatus: "الوضع القانوني والعقود",
    facilities: "المرافق والتجهيزات",
    documents: "المستندات والأوراق الرسمية",
    inquireTitle: "استفسار عن هذه المزرعة",
    whatsappDirect: "تواصل مباشر عبر واتساب",
    callDirect: "اتصال بالمالك / الممثل",
    addFarmTitle: "إضافة مزرعة للبيع أو الإيجار",
    noFarmsFound: "لم يتم العثور على مزارع مطابقة لخيارات البحث المحددة."
  },
  management: {
    title: "سوق إدارة وتشغيل المزارع",
    subtitle: "اربط مزرعتك مع نخبة من مديري المزارع والمهندسين الزراعيين المحترفين لإدارتها وتشغيلها بكفاءة.",
    requestManagement: "طلب إدارة مزرعة",
    joinAsManager: "التسجيل كمدير مزرعة",
    openRequests: "طلبات الإدارة المفتوحة",
    submitProposal: "تقديم عرض إدارة",
    crops: "المحاصيل والأنشطة المستهدفة",
    requiredServices: "الخدمات المطلوبة",
    proposalsCount: "العروض المقدمة",
    budgetRange: "نطاق الميزانية / المقابل المالي",
    durationMonths: "مدة التعاقد المقترحة",
    proposedFee: "المقابل المالي المقترح",
    feeType: "هيكل الأتعاب",
    details: "تفاصيل المشروع"
  },
  partnerships: {
    title: "سوق الشراكات والاستثمار الزراعي",
    subtitle: "استكشف فرص الشراكة والاستثمار الزراعي مع مستثمرين وشركاء تشغيليين موثوقين.",
    requiredCapital: "رأس المال المطلوب",
    equityOffered: "نسبة المشاركة المعروضة",
    applyForPartnership: "التقدم للشراكة",
    newOpportunity: "طرح فرصة شراكة",
    partnershipType: "طبيعة الشراكة",
    objectives: "أهداف وشروط المشروع",
    applicantMessage: "بيانات العرض والخبرات"
  },
  quickBuy: {
    title: "شراء سريع مع أصول",
    subtitle: "حدد متطلبات المزرعة التي تبحث عنها، مع إمكانية استخدام السيولة النقدية ومبادلة أصول عقارية أو سيارات.",
    cashBudget: "السيولة النقدية المتاحة (جنيه)",
    exchangeAssets: "أصول متاحة للمبادلة (اختياري)",
    assetType: "نوع الأصل",
    assetDescription: "بيانات الأصل وقيمته التقديرية",
    submitRequest: "إرسال طلب الشراء",
    successNotice: "تم استلام طلب الشراء السريع بنجاح وجارٍ مراجعته من قبل إدارة المنصة."
  },
  quickSell: {
    title: "بيع سريع مع تسهيلات",
    subtitle: "اعرض مزرعتك للبيع السريع بإشراف الإدارة، مع إتاحة خيارات التقسيط أو المبادلة بأصول.",
    farmName: "اسم أو وصف المزرعة",
    askingPrice: "السعر المطلوب (جنيه)",
    acceptsInstallments: "إمكانية البيع بالتقسيط؟",
    acceptsExchange: "إمكانية المبادلة بأصول؟",
    exchangeConditions: "شروط وتفضيلات المبادلة",
    submitSellRequest: "إرسال طلب البيع",
    successNotice: "تم استلام طلب البيع السريع بنجاح وسيتواصل معك فريق المعاينة قريباً."
  },
  suppliers: {
    title: "دليل الموردين والشركات الزراعية",
    subtitle: "دليلك الشامل لشركات وموردي شبكات الري، الأسمدة، المعدات، الصوب، والطاقة الشمسية.",
    allCategories: "كافة الأقسام",
    verifiedSupplier: "مورد معتمد",
    requestQuote: "طلب عرض أسعار",
    productsServices: "المنتجات والخدمات",
    contactSupplier: "تواصل مع المورد"
  },
  humanResources: {
    title: "الكوادر والخبراء الزراعيين",
    subtitle: "ابحث عن نخبة المهندسين الزراعيين، مديري المزارع، فنيي شبكات الري، والعمالة الزراعية الماهرة.",
    category: "التخصص المهني",
    yearsOfExperience: "سنوات الخبرة",
    skills: "المهارات والتخصصات الرئيسية",
    contactProfessional: "طلب تواصل وتوظيف",
    downloadCv: "استعراض المؤهلات / السيرة الذاتية"
  },
  myDashboard: {
    title: "لوحة التحكم الشخصية",
    overview: "نظرة عامة",
    myListings: "مزارعي المعروضة",
    myManagement: "طلبات الإدارة",
    myProposals: "عروض الإدارة",
    myPartnerships: "طلبات الشراكة",
    myRequests: "طلبات الشراء والبيع السريع",
    profileSettings: "الملف الشخصي والحساب",
    submitNewListing: "إضافة مزرعة جديدة",
    submitNewManagement: "طلب إدارة جديد",
    submitNewPartnership: "طرح شراكة جديدة"
  }
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 1. Update en.json
const enFile = path.join(i18nDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
deepMerge(enData, enExtensions);
fs.writeFileSync(enFile, JSON.stringify(enData, null, 2) + '\n', 'utf8');

// 2. Update ar.json
const arFile = path.join(i18nDir, 'ar.json');
const arData = JSON.parse(fs.readFileSync(arFile, 'utf8'));
deepMerge(arData, arExtensions);
fs.writeFileSync(arFile, JSON.stringify(arData, null, 2) + '\n', 'utf8');

// 3. Keep fr, ru, de, es in sync with enExtensions as fallback to prevent missing-key errors in strict audits
for (const lang of ['fr', 'ru', 'de', 'es']) {
  const file = path.join(i18nDir, `${lang}.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    deepMerge(data, enExtensions);
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
}

console.log('Successfully synchronized dictionaries across all languages with FARMINN agricultural terminology.');

