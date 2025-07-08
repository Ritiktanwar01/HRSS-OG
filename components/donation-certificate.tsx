"use client"

import { Award } from "lucide-react"
import { useEffect } from "react"

export default function DonationCertificate({ data }: { data: any }) {

// Simple number to words function for demonstration (supports up to 9999)
function NumberToWords({ num }: { num: number }): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + NumberToWords({ num: num % 100 }) : "");
  if (num < 10000) return ones[Math.floor(num / 1000)] + " Thousand" + (num % 1000 ? " " + NumberToWords({ num: num % 1000 }) : "");
  return num.toString();
}

interface FormatToLocalDateOptions {
  isoString: string;
}

function formatToLocalDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
}

function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
}

interface CreateUniqueCodeParams {
  dateStr: string;
  numberStr: string;
  prefixStr: string;
}

interface CreateUniqueCodeParams {
  dateStr: string;
  numberStr: string;
  prefixStr: string;
}

function createUniqueCode(
  dateStr: CreateUniqueCodeParams["dateStr"],
  numberStr: CreateUniqueCodeParams["numberStr"],
  prefixStr: CreateUniqueCodeParams["prefixStr"]
): string {
  const date = new Date(dateStr);

  // Extract first character from prefix string
  const prefixInitial: string = prefixStr.charAt(0).toUpperCase();

  // Break down the date into components
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const day: string = String(date.getDate()).padStart(2, '0');
  const time: string = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

  // Combine parts into a unique string
  return `${prefixInitial}${year}${month}${day}${time}${numberStr}`;
}

  useEffect(()=>{
    window.print()
  },[])
  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden" id="bodycert">
      {/* Front Side */}
      <div className="w-full h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-full max-h-[100vh] bg-gradient-to-br from-orange-50 to-orange-100 border-8 border-orange-500 relative overflow-hidden print:w-[32cm] print:h-[23cm] print:border-4">
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-orange-400 print:top-2 print:left-2 print:w-6 print:h-6"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-orange-400 print:top-2 print:right-2 print:w-6 print:h-6"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-orange-400 print:bottom-2 print:left-2 print:w-6 print:h-6"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-orange-400 print:bottom-2 print:right-2 print:w-6 print:h-6"></div>

          {/* Front content */}
          <div className="h-full flex flex-col justify-between p-8 print:p-6">
            {/* Header */}
            <div className="text-center flex-shrink-0">
              <div className="flex justify-center mb-4">
                <Award className="w-12 h-12 text-orange-500 print:w-10 print:h-10" />
              </div>
              <h1 className="text-3xl font-bold text-orange-600 mb-2 print:text-2xl">हिंदू राष्ट्र सेवक संघ चैरिटेबल ट्रस्ट</h1>
              <p className="text-lg text-gray-600 print:text-base">Hindu Rashtra Sevak Sangh Charitable Trust</p>
            </div>

            {/* Certificate Title */}
            <div className="text-center flex-shrink-0 my-6">
              <h2 className="text-4xl font-bold text-orange-700 mb-4 print:text-3xl">DONATION CERTIFICATE</h2>
              <div className="w-32 h-1 bg-orange-500 mx-auto print:w-24"></div>
            </div>

            {/* Certificate Body */}
            <div className="text-center flex-grow flex flex-col justify-center space-y-4 print:space-y-3">
              <p className="text-xl text-gray-700 print:text-base">This is to certify that</p>

              <div className="border-b-3 border-orange-300 pb-3 mb-4 mx-8">
                <p className="text-3xl font-bold text-orange-700 py-2 print:text-xl">{data.donations.name}</p>
                <p className="text-base text-gray-500 print:text-sm">(Donor Name)</p>
              </div>

              <div className="space-y-3 print:space-y-2">
                <p className="text-xl text-gray-700 print:text-base">has generously donated an amount of</p>
                <div className="text-3xl font-bold text-orange-700 print:text-xl">
                  ₹ <span className="border-b-3 border-gray-400 px-3 py-1 inline-block min-w-[150px]">{data.donations.amount}</span>
                </div>
                <p className="text-lg text-gray-700 print:text-base">
                  (Rupees{" "}
                  <span className="border-b-2 border-gray-300 px-2 inline-block min-w-[250px]">{NumberToWords(data.donations.amount)}</span>{" "}
                  only)
                </p>
                <p className="text-lg text-gray-700 print:text-base">
                  to our charitable trust on{" "}
                  <span className="border-b-2 border-gray-300 px-2 inline-block min-w-[150px]">{formatToLocalDate(data.donations.createdAt)}</span>
                </p>
              </div>

              <div className="mt-6 px-4">
                <p className="text-base text-gray-600 leading-relaxed print:text-sm">
                  We express our heartfelt gratitude for this noble contribution towards the betterment of society.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end flex-shrink-0 mt-6">
              <div className="text-left">
                <p className="text-base text-gray-600 mb-3 print:text-sm">
                  Date: <span className="border-b-2 border-gray-400 px-2 inline-block min-w-[120px]">{getCurrentDateTime()}</span>
                </p>
                <p className="text-base text-gray-600 print:text-sm">
                  Receipt No:{" "}
                  <span className="border-b-2 border-gray-400 px-2 inline-block min-w-[120px]">DNN{createUniqueCode(data.donations.createdAt,data.donations.amount,data.donations.name)}</span>
                </p>
              </div>

              <div className="text-right">
                <div className="border-t-3 border-gray-400 pt-3 w-48 print:w-36">
                  <p className="text-base font-semibold text-gray-700 print:text-sm">President Signature</p>
                  <p className="text-sm text-gray-500 mt-1 print:text-xs">हिंदू राष्ट्र सेवक संघ चैरिटेबल ट्रस्ट</p>
                  <p className="text-xs text-gray-400 print:text-[10px]">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Side */}
      <div className="w-full h-screen flex items-center justify-center p-4 print:page-break-before">
        <div className="w-full max-w-4xl h-full max-h-[100vh] bg-gradient-to-br from-orange-50 to-orange-100 border-8 border-orange-500 relative overflow-hidden print:w-[32cm] print:h-[23cm] print:border-4">
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-orange-400 print:top-2 print:left-2 print:w-6 print:h-6"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-orange-400 print:top-2 print:right-2 print:w-6 print:h-6"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-orange-400 print:bottom-2 print:left-2 print:w-6 print:h-6"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-orange-400 print:bottom-2 print:right-2 print:w-6 print:h-6"></div>

          {/* Back content */}
          <div className="h-full flex flex-col justify-between p-8 print:p-6">
            {/* Header */}
            <div className="text-center flex-shrink-0">
              <h2 className="text-3xl font-bold text-orange-700 mb-4 print:text-2xl">CERTIFICATE VERIFICATION</h2>
              <div className="w-32 h-1 bg-orange-500 mx-auto mb-6 print:w-24"></div>
            </div>

            {/* Trust Information */}
            <div className="flex-grow space-y-6 print:space-y-4">
              <div className="bg-white/60 rounded-lg p-6 print:p-4 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-orange-700 mb-4 print:text-lg">Trust Information</h3>
                <div className="space-y-2 text-base print:text-sm">
                  <p className="text-gray-700">
                    <strong className="text-orange-600">Registration No:</strong> HRSS/2024/001
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-orange-600">Website:</strong> www.hrssindia.org
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-orange-600">Address:</strong> Hodal, Haryana
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-orange-600">Contact:</strong> 9053436854
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-orange-600">Email:</strong> info@hrssindia.org
                  </p>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-white/60 rounded-lg p-6 print:p-4 text-center border-2 border-orange-200">
                <h3 className="text-xl font-bold text-orange-700 mb-4 print:text-lg">Verify Certificate</h3>
                <div className="flex justify-center mb-4">
                  {/* QR Code placeholder */}
                  <div className="w-32 h-32 print:w-24 print:h-24 bg-white border-4 border-orange-300 flex items-center justify-center rounded-lg">
                    <div className="text-xs text-gray-600 text-center print:text-[10px]">
                      QR Code
                      <br />
                      DNN{createUniqueCode(data.donations.createdAt,data.donations.amount,data.donations.name)}
                    </div>
                  </div>
                </div>
                <p className="text-base text-gray-600 print:text-sm">
                  Scan this QR code to verify the authenticity of this certificate
                </p>
              </div>

              {/* Legal Notes */}
              <div className="bg-white/60 rounded-lg p-6 print:p-4 border-2 border-orange-200">
                <h3 className="text-lg font-bold text-orange-700 mb-3 print:text-base">Important Notes</h3>
                <div className="text-sm text-gray-600 space-y-2 print:text-xs print:space-y-1">
                  <p>
                    • This certificate is issued for donation received. Please preserve this certificate for your
                    records.
                  </p>
                  <p>
                    • Donations to this trust are eligible for tax exemption under Section 80G of Income Tax Act, 1961.
                  </p>
                  <p>
                    • This donation will be utilized for welfare activities and charitable purposes of the organization.
                  </p>
                  <p>• For any queries regarding this donation, please contact us at the above mentioned details.</p>
                  <p>• Certificate validity can be verified using the QR code or receipt number.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center flex-shrink-0 mt-6 pt-4 border-t-3 border-orange-300">
              <p className="text-sm text-gray-600 print:text-xs">
                This is an official donation certificate issued by Hindu Rashtra Sevak Sangh Charitable Trust
              </p>
              <p className="text-xs text-gray-500 mt-2 print:text-[10px]">
                हिंदू राष्ट्र सेवक संघ चैरिटेबल ट्रस्ट द्वारा जारी किया गया आधिकारिक दान प्रमाणपत्र
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 32cm 23cm;
            margin: 0.5cm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print\\:page-break-before {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  )
}
