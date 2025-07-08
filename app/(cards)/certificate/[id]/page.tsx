"use client"
import DonationCertificate from '@/components/donation-certificate'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'



const page = () => {
   const {id} = useParams()

   const [info,setinfo]= useState({})
   const [isDonation,setIsdonation] = useState(false)

   const FetchData = async ()=>{
    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donations/donation-cert/${id}`)
    const data = await req.json()
    
    if (data.status == "success"){
      console.log(data)
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
    isDonation ? <Loading /> : <DonationCertificate data={info} />
  )
}

export default page