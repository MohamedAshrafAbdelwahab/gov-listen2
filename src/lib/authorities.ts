// Demo registry of African government authorities mapped by country + category.
export type Authority = {
  name: { en: string; ar: string };
  email: string;
  country: string;
};

export const AUTHORITIES: Record<string, Record<string, Authority>> = {
  EG: {
    roads: { name: { en: "Cairo Roads & Bridges Authority", ar: "هيئة الطرق والكباري بالقاهرة" }, email: "roads@cairo.gov.eg", country: "Egypt" },
    water: { name: { en: "Holding Company for Water & Wastewater", ar: "الشركة القابضة لمياه الشرب والصرف" }, email: "report@hcww.com.eg", country: "Egypt" },
    electricity: { name: { en: "Egyptian Electricity Distribution Co.", ar: "شركة توزيع الكهرباء المصرية" }, email: "support@eedc.gov.eg", country: "Egypt" },
    waste: { name: { en: "Cairo Cleaning & Beautification Authority", ar: "هيئة النظافة والتجميل بالقاهرة" }, email: "waste@cairo.gov.eg", country: "Egypt" },
    safety: { name: { en: "Egyptian Civil Protection", ar: "الحماية المدنية المصرية" }, email: "safety@gov.eg", country: "Egypt" },
    other: { name: { en: "Local Municipality (Egypt)", ar: "المحلية" }, email: "info@gov.eg", country: "Egypt" },
  },
  KE: {
    roads: { name: { en: "Kenya Urban Roads Authority", ar: "هيئة الطرق الحضرية بكينيا" }, email: "info@kura.go.ke", country: "Kenya" },
    water: { name: { en: "Nairobi City Water & Sewerage Co.", ar: "شركة مياه نيروبي" }, email: "info@nairobiwater.co.ke", country: "Kenya" },
    electricity: { name: { en: "Kenya Power", ar: "شركة كهرباء كينيا" }, email: "customercare@kplc.co.ke", country: "Kenya" },
    waste: { name: { en: "Nairobi City County Environment", ar: "إدارة البيئة بنيروبي" }, email: "environment@nairobi.go.ke", country: "Kenya" },
    safety: { name: { en: "Kenya National Disaster Operations", ar: "العمليات الوطنية للكوارث" }, email: "ops@disaster.go.ke", country: "Kenya" },
    other: { name: { en: "County Government (Kenya)", ar: "حكومة المقاطعة" }, email: "info@gov.ke", country: "Kenya" },
  },
  NG: {
    roads: { name: { en: "Federal Roads Maintenance Agency", ar: "وكالة صيانة الطرق الفيدرالية" }, email: "info@fersa.gov.ng", country: "Nigeria" },
    water: { name: { en: "Lagos Water Corporation", ar: "هيئة مياه لاجوس" }, email: "info@lagoswater.org", country: "Nigeria" },
    electricity: { name: { en: "Nigerian Electricity Regulatory Commission", ar: "هيئة تنظيم الكهرباء" }, email: "info@nerc.gov.ng", country: "Nigeria" },
    waste: { name: { en: "Lagos State Waste Management Authority", ar: "هيئة إدارة النفايات بلاجوس" }, email: "info@lawma.gov.ng", country: "Nigeria" },
    safety: { name: { en: "Nigerian Emergency Management Agency", ar: "هيئة إدارة الطوارئ" }, email: "info@nema.gov.ng", country: "Nigeria" },
    other: { name: { en: "Local Government (Nigeria)", ar: "الحكومة المحلية" }, email: "info@gov.ng", country: "Nigeria" },
  },
  ZA: {
    roads: { name: { en: "South African National Roads Agency", ar: "وكالة الطرق الوطنية بجنوب أفريقيا" }, email: "info@nra.co.za", country: "South Africa" },
    water: { name: { en: "Department of Water & Sanitation", ar: "وزارة المياه والصرف الصحي" }, email: "info@dws.gov.za", country: "South Africa" },
    electricity: { name: { en: "Eskom", ar: "إسكوم" }, email: "customerservices@eskom.co.za", country: "South Africa" },
    waste: { name: { en: "Municipal Waste Management", ar: "إدارة النفايات البلدية" }, email: "waste@gov.za", country: "South Africa" },
    safety: { name: { en: "SA Disaster Management Centre", ar: "مركز إدارة الكوارث" }, email: "info@ndmc.gov.za", country: "South Africa" },
    other: { name: { en: "Municipality (South Africa)", ar: "البلدية" }, email: "info@gov.za", country: "South Africa" },
  },
  GH: {
    roads: { name: { en: "Department of Urban Roads, Ghana", ar: "إدارة الطرق الحضرية بغانا" }, email: "info@dur.gov.gh", country: "Ghana" },
    water: { name: { en: "Ghana Water Company", ar: "شركة مياه غانا" }, email: "info@gwcl.com.gh", country: "Ghana" },
    electricity: { name: { en: "Electricity Company of Ghana", ar: "شركة كهرباء غانا" }, email: "customercare@ecg.com.gh", country: "Ghana" },
    waste: { name: { en: "Accra Metropolitan Waste", ar: "إدارة نفايات أكرا" }, email: "waste@ama.gov.gh", country: "Ghana" },
    safety: { name: { en: "Ghana National Fire Service", ar: "الإطفاء الوطني بغانا" }, email: "info@gnfs.gov.gh", country: "Ghana" },
    other: { name: { en: "Local Assembly (Ghana)", ar: "الجمعية المحلية" }, email: "info@gov.gh", country: "Ghana" },
  },
};

export const CATEGORIES = ["roads", "water", "electricity", "waste", "safety", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export function resolveAuthority(countryCode: string, category: Category): Authority {
  const cc = countryCode.toUpperCase();
  const country = AUTHORITIES[cc] ?? AUTHORITIES.EG;
  return country[category] ?? country.other;
}

export const COUNTRY_NAMES: Record<string, { en: string; ar: string }> = {
  DZ: { en: "Algeria", ar: "الجزائر" },
  AO: { en: "Angola", ar: "أنغولا" },
  BJ: { en: "Benin", ar: "بنين" },
  BW: { en: "Botswana", ar: "بوتسوانا" },
  BF: { en: "Burkina Faso", ar: "بوركينا فاسو" },
  BI: { en: "Burundi", ar: "بوروندي" },
  CM: { en: "Cameroon", ar: "الكاميرون" },
  CV: { en: "Cape Verde", ar: "الرأس الأخضر" },
  CF: { en: "Central African Republic", ar: "جمهورية أفريقيا الوسطى" },
  TD: { en: "Chad", ar: "تشاد" },
  KM: { en: "Comoros", ar: "جزر القمر" },
  CD: { en: "Democratic Republic of the Congo", ar: "جمهورية الكونغو الديمقراطية" },
  CG: { en: "Republic of the Congo", ar: "جمهورية الكونغو" },
  DJ: { en: "Djibouti", ar: "جيبوتي" },
  EG: { en: "Egypt", ar: "مصر" },
  GQ: { en: "Equatorial Guinea", ar: "غينيا الاستوائية" },
  ER: { en: "Eritrea", ar: "إريتريا" },
  SZ: { en: "Eswatini", ar: "إسواتيني (سوازيلاند سابقاً)" },
  ET: { en: "Ethiopia", ar: "إثيوبيا" },
  GA: { en: "Gabon", ar: "الغابون" },
  GM: { en: "Gambia", ar: "غامبيا" },
  GH: { en: "Ghana", ar: "غانا" },
  GN: { en: "Guinea", ar: "غينيا" },
  GW: { en: "Guinea-Bissau", ar: "غينيا بيساو" },
  CI: { en: "Ivory Coast", ar: "ساحل العاج" },
  KE: { en: "Kenya", ar: "كينيا" },
  LS: { en: "Lesotho", ar: "ليسوتو" },
  LR: { en: "Liberia", ar: "ليبيريا" },
  LY: { en: "Libya", ar: "ليبيا" },
  MG: { en: "Madagascar", ar: "مدغشقر" },
  MW: { en: "Malawi", ar: "ملاوي" },
  ML: { en: "Mali", ar: "مالي" },
  MR: { en: "Mauritania", ar: "موريتانيا" },
  MU: { en: "Mauritius", ar: "موريشيوس" },
  MA: { en: "Morocco", ar: "المغرب" },
  MZ: { en: "Mozambique", ar: "موزمبيق" },
  NA: { en: "Namibia", ar: "ناميبيا" },
  NE: { en: "Niger", ar: "النيجر" },
  NG: { en: "Nigeria", ar: "نيجيريا" },
  RW: { en: "Rwanda", ar: "رواندا" },
  ST: { en: "Sao Tome and Principe", ar: "ساو تومي وبرينسيب" },
  SN: { en: "Senegal", ar: "السنغال" },
  SC: { en: "Seychelles", ar: "سيشل" },
  SL: { en: "Sierra Leone", ar: "سيراليون" },
  SO: { en: "Somalia", ar: "الصومال" },
  ZA: { en: "South Africa", ar: "جنوب أفريقيا" },
  SS: { en: "South Sudan", ar: "جنوب السودان" },
  SD: { en: "Sudan", ar: "السودان" },
  TZ: { en: "Tanzania", ar: "تنزانيا" },
  TG: { en: "Togo", ar: "توغو" },
  TN: { en: "Tunisia", ar: "تونس" },
  UG: { en: "Uganda", ar: "أوغندا" },
  ZM: { en: "Zambia", ar: "زامبيا" },
  ZW: { en: "Zimbabwe", ar: "زيمبابوي" },
  EH: { en: "Sahrawi Arab Democratic Republic", ar: "الجمهورية العربية الصحراوية الديمقراطية" },
};
