"use client"
import IDCARD from '@/components/id-card'
import { useParams } from 'next/navigation'
import React from 'react'

type Data = {
    name: string;
    uid: string;
    DOB: string;
    position: string;
    validFrom: string;
    validTo: string;
    emergencyContact: string;
    image: string;
    qrcode: string;
    fatherName: string;
    mobile: string;
    address: string;
};

interface IDCARDProps {
    data: Data;
}


const page = () => {
    const params = useParams()
    const { id } = params as { id: string }

    const [member, setMember] = React.useState<Data | null>(null)

    React.useEffect(() => {
      const fetchMember = async () => {
        const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-members/public/${id}`, {
          method: "GET",
        })
        const data = await req.json()
        if (!req.ok) {
          console.error("Error fetching member data:", data)
          setMember(null)
        } else {
          console.log(data)
          setMember(data)
        }
      }
      fetchMember()
    }, [id])

    if (!member) {
      return <div>Loading...</div>
    }

    return (
      <IDCARD data={member} />
    )
}

export default page