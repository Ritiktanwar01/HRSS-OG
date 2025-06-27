"use client"
import { Button } from "@/components/ui/button"
import { Printer, Award } from "lucide-react"

export default function DonationCertificate() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
        <div className="mb-4 print:hidden">
          <Button onClick={handlePrint} className="inline-flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Certificate
          </Button>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-none bg-gradient-to-br from-orange-50 to-orange-100 border-8 border-orange-500 print:w-[32cm] print:h-[23cm] print:border-4 relative min-h-[calc(100vh-120px)] print:min-h-0">
            {/* Inner content container with proper padding to stay within border */}
            <div className="absolute inset-8 print:inset-4 flex flex-col justify-between h-[calc(100%-4rem)] print:h-[calc(100%-2rem)]">
              {/* Decorative corner elements - positioned relative to inner container */}
              <div className="absolute -top-4 -left-4 w-12 h-12 border-l-4 border-t-4 border-orange-400 print:-top-2 print:-left-2 print:w-6 print:h-6"></div>
              <div className="absolute -top-4 -right-4 w-12 h-12 border-r-4 border-t-4 border-orange-400 print:-top-2 print:-right-2 print:w-6 print:h-6"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-l-4 border-b-4 border-orange-400 print:-bottom-2 print:-left-2 print:w-6 print:h-6"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-r-4 border-b-4 border-orange-400 print:-bottom-2 print:-right-2 print:w-6 print:h-6"></div>

              {/* Header */}
              <div className="text-center mb-4">
                <div className="flex justify-center mb-4">
                  <Award className="w-16 h-16 text-orange-500 print:w-10 print:h-10" />
                </div>
                <h1 className="text-4xl font-bold text-orange-600 mb-3 print:text-2xl">हिंदू राष्ट्र सेवक संघ चैरिटेबल ट्रस्ट</h1>
                <p className="text-xl text-gray-600 print:text-base">Hindu Rashtra Sevak Sangh Charitable Trust</p>
                <p className="text-base text-gray-500 mt-1 print:text-sm">Reg. No: HRSS/2024/001 | www.hrssindia.org</p>
                <p className="text-sm text-gray-500 print:text-xs">Hodal, Haryana | Contact: 9053436854</p>
              </div>

              {/* Certificate Title */}
              <div className="text-center mb-6">
                <h2 className="text-5xl font-bold text-orange-700 mb-4 print:text-3xl">DONATION CERTIFICATE</h2>
                <div className="w-32 h-1 bg-orange-500 mx-auto print:w-24"></div>
              </div>

              {/* Certificate Body */}
              <div className="text-center mb-6 space-y-4 flex-grow flex flex-col justify-center">
                <p className="text-xl text-gray-700 print:text-base">This is to certify that</p>

                <div className="border-b-3 border-orange-300 pb-2 mb-4 mx-8">
                  <p className="text-3xl font-bold text-orange-700 print:text-xl min-h-[50px] flex items-center justify-center">
                    Ritik Tanwar
                  </p>
                  <p className="text-base text-gray-500 mt-1 print:text-sm">(Donor Name)</p>
                </div>

                <div className="space-y-3">
                  <p className="text-xl text-gray-700 print:text-base">has generously donated an amount of</p>
                  <div className="text-3xl font-bold text-orange-700 print:text-xl">
                    ₹ <span className="border-b-3 border-gray-400 px-3 py-1 inline-block min-w-[150px]">500</span>
                  </div>
                  <p className="text-lg text-gray-700 print:text-base">
                    (Rupees{" "}
                    <span className="border-b-2 border-gray-300 px-2 inline-block min-w-[300px]">
                      Five Hundred Only
                    </span>{""}
                    only)
                  </p>
                  <p className="text-lg text-gray-700 print:text-base">
                    to our charitable trust on{" "}
                    <span className="border-b-2 border-gray-300 px-2 inline-block min-w-[150px]">26/06/2025</span>
                  </p>
                </div>

                <div className="mt-6 px-4">
                  <p className="text-lg text-gray-600 leading-relaxed print:text-sm">
                    This donation will be utilized for the welfare activities and charitable purposes of the
                    organization. We express our heartfelt gratitude for this noble contribution towards the betterment
                    of society.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end mt-6">
                <div className="text-left">
                  <p className="text-base text-gray-600 mb-3 print:text-sm">
                    Date:{""}
                    <span className="border-b-2 border-gray-400 px-2 inline-block min-w-[120px]">12/10/2005</span>
                  </p>
                  <p className="text-base text-gray-600 print:text-sm">
                    Receipt No:{" "}
                    <span className="border-b-2 border-gray-400 px-2 inline-block min-w-[120px]">DNN20250610</span>
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

              {/* Legal Note */}
              <div className="mt-4 pt-4 border-t-2 border-gray-300">
                <p className="text-xs text-gray-500 text-center leading-relaxed print:text-[10px]">
                  * This certificate is issued for donation received. Please preserve this certificate for your records.
                  <br />* Donations to this trust are eligible for tax exemption under Section 80G of Income Tax Act,
                  1961.
                  <br />* For any queries regarding this donation, please contact us at the above mentioned details.
                </p>
              </div>
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
        }
      `}</style>
    </>
  )
}
