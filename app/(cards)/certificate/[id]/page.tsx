"use client"
import DonationCertificate from '@/components/donation-certificate'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'



const page = () => {
   const {id} = useParams()

   const fetchData = async ()=>{
    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donations/donation-cert/${id}`)
    const data = await req.json()
    console.log(data)
   }
useEffect(()=>{
    fetchData()
   },[])
  return (
    <DonationCertificate/>
  )
}

export default page