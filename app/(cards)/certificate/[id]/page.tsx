"use client"
import DonationCertificate from '@/components/donation-certificate'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import QRCode from "qrcode";



const page = () => {
   const {id} = useParams()
   const [svgCode, setSvgCode] = useState('');


   const [info,setinfo]= useState({})
   const [isDonation,setIsdonation] = useState(false)

   const FetchData = async ()=>{
    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donations/donation-cert/${id}`)
    const data = await req.json()
    
    if (data.donations.paymentStatus == "success"){
      await QRCode.toString('https://hrssindia.org/certificate?id=12345', { type: 'svg' })
      .then((svg: string) => setSvgCode(svg))
      .catch((err: Error) => console.error(err));
      data.qrcode = svgCode
      setinfo(data)
      setIsdonation(true)
    }

   }

   const Loading = ()=>{
    return <h4>Loading...</h4>
   }
useEffect(()=>{
    FetchData()
   },[])
  return (
    isDonation?<DonationCertificate data={info} /> : <Loading />  
  )
}

export default page