"use client"

import { Card } from "@/components/ui/card"
import { useEffect } from "react"


type Data = {
    name: string;
    uid: string;
    dob: string;
    designation: string;
    validFrom: string;
    validTo: string;
    emergencyContact: string;
    image: string;
    qr_code: string;
    fName: string;
    Mobile?: string;
    address: string;
};

interface IDCARDProps {
    data: Data;
}

export default function IDCARD({data}: IDCARDProps) {
  useEffect(() => {
    window.print()
  },[])
  return (
    <>
      <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">

        <div className="flex gap-6 justify-center items-start print:gap-2 print:justify-start">
          {/* Front Side */}
          <Card className="w-80 h-[500px] bg-orange-500 text-white p-6 rounded-lg shadow-lg print:w-[6cm] print:h-[9cm] print:shadow-none print:rounded-none print:p-3">
            <div className="text-center mb-4 print:mb-2">
              <h2 className="text-lg font-bold leading-tight print:text-xs print:leading-tight">
                हिंदू राष्ट्र सेवक संघ चैरिटेबल ट्रस्ट
              </h2>
            </div>

            <div className="flex justify-center mb-4 print:mb-2">
              <div className="w-24 h-28 bg-gray-200 rounded overflow-hidden print:w-12 print:h-14">
                <img src="/portrait.png" alt="Raman Lal" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="text-center mb-4 print:mb-2">
              <h3 className="text-xl font-bold print:text-sm">{data.name}</h3>
            </div>

            <div className="space-y-2 text-sm print:space-y-1 print:text-xs">
              <div className="flex justify-start gap-1">
                <span className="font-bold">UID</span>
                <span className="font-semibold">: {data.uid}</span>
              </div>
              <div className="flex justify-start gap-1">
                <span className="font-bold">D.O.B</span>
                <span className="font-semibold">: {data.dob}</span>
              </div>
              <div className="flex justify-start gap-1">
                <span className="font-bold">Designation</span>
                <span className="font-semibold">: {data.designation}</span>
              </div>
              <div className="flex justify-start gap-1">
                <span className="font-bold">Valid From</span>
                <span className="font-semibold">: {data.validFrom}</span>
              </div>
              <div className="flex justify-start gap-1">
                <span className="font-bold">Valid To</span>
                <span className="font-semibold">: {data.validTo}</span>
              </div>
            </div>

            <div className="mt-8 print:mt-4">
              <div className="border-t border-white/30 pt-2 print:pt-1">
                <p className="text-xs print:text-[8px] text-center">Emergency Contact: 9053436854</p>
              </div>
            </div>

            <div className="mt-auto pt-4 text-right print:pt-2">
              <p className="text-xs print:text-[8px]">President signature</p>
            </div>
          </Card>

          {/* Back Side */}
          <Card className="w-80 h-[500px] bg-orange-500 text-white p-6 rounded-lg shadow-lg print:w-[6cm] print:h-[9cm] print:shadow-none print:rounded-none print:p-3">
            <div className="text-center mb-4 print:mb-2">
              <h2 className="text-lg font-bold leading-tight print:text-xs print:leading-tight">
                हिंदू राष्ट्र सेवक संघ चैरिटेबल ट्रस्ट
              </h2>
              <p className="text-sm print:text-[10px]">(HRSS)</p>
            </div>

            <div className="flex justify-center mb-4 print:mb-2">
              <div className="w-20 h-20 bg-white p-2 rounded print:w-10 print:h-10 print:p-1">
                <img className="h-full" src={data.qr_code} alt="" />
              </div>
            </div>

            <div className="space-y-2 text-xs print:space-y-1 print:text-[8px]">
              <div>
                <span className="font-bold">S/O :</span> {data.fName}
              </div>
              <div>
                <span className="font-bold">Mobile :</span> {data.Mobile}
              </div>
              <div>
                <span className="font-bold">Address :</span> {data.address}
              </div>
            </div>

            <div className="mt-4 text-xs print:mt-2 print:text-[8px]">
              <p className="font-bold">* Note :</p>
              <p className="leading-tight print:leading-tight">
                This card is not any kind of residential/I.D.O.B or it is not applicable for government identification
                proof
              </p>
              <p className="mt-2 text-xs leading-tight print:text-[7px] print:leading-tight">
                यह कार्ड किसी भी प्रकार का आवासीय/पहचान पत्र प्रमाण का यह सरकारी पहचान पत्र के लिए लागू नहीं है
              </p>
            </div>

            <div className="mt-auto pt-4 text-center print:pt-2">
              <p className="text-xs print:text-[8px]">https://hrssindia.org</p>
              <p className="text-xs print:text-[8px] mt-1">Reg. No: HRSS/2024/001</p>
            </div>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
            padding: 0;
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
