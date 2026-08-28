import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function SchemeFAQ({ schemeName = 'Government Scheme', faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  const defaultFaqs = [
    {
      qEn: `Who is eligible to apply for ${schemeName}?`,
      qHi: `${schemeName} के लिए कौन पात्र है?`,
      aEn: `Citizens matching the age limit, annual income criteria, and occupation guidelines listed under the eligibility section can apply.`,
      aHi: `आयु सीमा, वार्षिक आय और व्यवसाय के मानदंडों को पूरा करने वाले सभी भारतीय नागरिक आवेदन कर सकते हैं।`
    },
    {
      qEn: `What documents are required for application submission?`,
      qHi: `आवेदन जमा करने के लिए किन दस्तावेजों की आवश्यकता है?`,
      aEn: `Primary documents include Aadhaar Card, Bank Account Passbook, Income Certificate, Caste/Category Certificate (if applicable), and Passport Photo.`,
      aHi: `मुख्य दस्तावेजों में आधार कार्ड, बैंक खाता पासबुक, आय प्रमाण पत्र, जाति प्रमाण पत्र और पासपोर्ट फोटो शामिल हैं।`
    },
    {
      qEn: `How is the cash benefit or subsidy disbursed?`,
      qHi: `नकद लाभ या सब्सिडी का भुगतान कैसे किया जाता है?`,
      aEn: `Financial grants are disbursed directly into the beneficiary's Aadhaar-seeded bank account via Direct Benefit Transfer (DBT).`,
      aHi: `वित्तीय सहायता प्रत्यक्ष लाभ अंतरण (DBT) के माध्यम से लाभार्थी के आधार-लिंक्ड बैंक खाते में स्थानांतरित की जाती है।`
    },
    {
      qEn: `Can an applicant apply through nearest Common Service Centre (CSC)?`,
      qHi: `क्या आवेदक निकटतम सामान्य सेवा केंद्र (CSC) के माध्यम से आवेदन कर सकता है?`,
      aEn: `Yes, certified Gram Panchayat VLEs and CSC Jan Seva Kendras can submit applications on your behalf using the Agent Portal.`,
      aHi: `हाँ, सीएससी जन सेवा केंद्र और वीएलई एजेंट पोर्टल के माध्यम से आपका आवेदन जमा कर सकते हैं।`
    }
  ];

  const listToRender = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-white">Frequently Asked Questions (FAQs) / अक्सर पूछे जाने वाले प्रश्न</h3>
      </div>

      <div className="space-y-3">
        {listToRender.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-semibold text-slate-200 hover:text-white"
              >
                <div>
                  <p className="text-slate-100">{faq.qEn}</p>
                  <p className="text-xs text-amber-400 font-normal mt-0.5">{faq.qHi}</p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-slate-300 space-y-2 border-t border-slate-800/60 pt-3">
                  <p className="leading-relaxed">{faq.aEn}</p>
                  <p className="text-slate-400 italic text-[11px] leading-relaxed">{faq.aHi}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
