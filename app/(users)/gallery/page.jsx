"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { X } from "lucide-react"

export default function GalleryPage() {
  const [galleryData, setGalleryData] = useState({
    events: [],
    serviceProjects: [],
    volunteers: [],
  })
  const [selectedItem, setSelectedItem] = useState(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gallery/public`)
        if (response.ok) {
          const data = await response.json()

          // Organize data by category
          const categorizedData = {
            events: data.filter((item) => item.category === "events"),
            serviceProjects: data.filter((item) => item.category === "serviceProjects"),
            volunteers: data.filter((item) => item.category === "volunteers"),
          }

          setGalleryData(categorizedData)
        }
      } catch (error) {
        console.error("Error fetching gallery items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGalleryItems()
  }, [])

  const handleItemClick = (item) => {
    setSelectedItem(item)
    if (item.type === "video") {
      setIsVideoPlaying(true)
    }
  }

  const handleDialogClose = () => {
    if (selectedItem?.type === "video") {
      setIsVideoPlaying(false)
    }
    setSelectedItem(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div>Loading gallery...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-bhagva-800 mb-4 text-center">Gallery</h1>
      <div className="h-1 w-20 bg-bhagva-600 mb-8 mx-auto"></div>

      <p className="text-gray-700 max-w-3xl mx-auto text-center mb-12">
        Explore the visual journey of our initiatives, events, and impact through these photographs and videos. Each
        image and video tells a story of service, dedication, and community.
      </p>

      <Tabs defaultValue="events" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="events" className="text-sm md:text-base">
            Events & Celebrations
          </TabsTrigger>
          <TabsTrigger value="serviceProjects" className="text-sm md:text-base">
            Service Projects
          </TabsTrigger>
          <TabsTrigger value="volunteers" className="text-sm md:text-base">
            Our Volunteers
          </TabsTrigger>
        </TabsList>

        {Object.entries(galleryData).map(([category, items]) => (
          <TabsContent key={category} value={category} className="mt-0">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No items in this category yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Dialog key={item._id} onOpenChange={(open) => !open && handleDialogClose()}>
                    <DialogTrigger asChild>
                      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={item.type === "image" ? item.url : item.thumbnail || item.url}
                              alt={item.title}
                              className="w-full h-48 object-cover"
                              width={400}
                              height={300}
                            />
                            {item.type === "video" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="white"
                                    className="w-6 h-6"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <p className="text-sm text-white/90 line-clamp-2">{item.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0" onClick={() => handleItemClick(item)}>
                      <DialogTitle className="sr-only">{item.title}</DialogTitle>
                      <div className="relative">
                        {selectedItem?.type === "image" ? (
                          <img
                            src={selectedItem.url || "/placeholder.svg"}
                            alt={selectedItem.title}
                            className="w-full max-h-[70vh] object-contain"
                          />
                        ) : (
                          selectedItem && (
                            <div className="w-full bg-black">
                              <video
                                src={selectedItem.url}
                                controls
                                autoPlay={isVideoPlaying}
                                className="w-full max-h-[70vh]"
                                onEnded={() => setIsVideoPlaying(false)}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )
                        )}
                        { /*<Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 rounded-full bg-black/40 hover:bg-black/60 text-white"
                          onClick={() => document.querySelector("[data-radix-dialog-close]")?.click()}
                        >
                          <X className="h-5 w-5" />
                        </Button>*/}
                        <div className="bg-white p-4">
                          <h3 className="font-semibold text-xl text-bhagva-800">{selectedItem?.title}</h3>
                          <p className="text-gray-700">{selectedItem?.description}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="text-center mt-16">
        <p className="text-gray-700 mb-6">Would you like to contribute your photos or videos to our gallery?</p>
        <Button
          variant="outline"
          className="border-bhagva-600 text-bhagva-700 hover:bg-bhagva-50"
          onClick={() => (window.location.href = "/contact")}
        >
          Contact Us
        </Button>
      </div>
    </div>
  )
}
