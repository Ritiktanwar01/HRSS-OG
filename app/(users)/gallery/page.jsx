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
    <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bhagva-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header Section */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-bhagva-800 mb-4">Gallery</h1>
        <div className="h-1 w-16 md:w-20 bg-bhagva-600 mb-6 md:mb-8 mx-auto"></div>
        <p className="text-gray-700 max-w-3xl mx-auto text-sm md:text-base leading-relaxed px-4">
          Explore the visual journey of our initiatives, events, and impact through these photographs and videos. Each
          image and video tells a story of service, dedication, and community.
        </p>
      </div>

      {/* Gallery Tabs */}
      <Tabs defaultValue="events" className="max-w-7xl mx-auto">
        {/* Mobile-friendly tabs */}
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 md:mb-8 h-auto">
          <TabsTrigger value="events" className="text-xs sm:text-sm md:text-base py-2 px-2 sm:px-4 whitespace-nowrap">
            Events & Celebrations
          </TabsTrigger>
          <TabsTrigger
            value="serviceProjects"
            className="text-xs sm:text-sm md:text-base py-2 px-2 sm:px-4 whitespace-nowrap"
          >
            Service Projects
          </TabsTrigger>
          <TabsTrigger
            value="volunteers"
            className="text-xs sm:text-sm md:text-base py-2 px-2 sm:px-4 whitespace-nowrap"
          >
            Our Volunteers
          </TabsTrigger>
        </TabsList>

        {Object.entries(galleryData).map(([category, items]) => (
          <TabsContent key={category} value={category} className="mt-0">
            {items.length === 0 ? (
              <div className="text-center py-16 md:py-20">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm md:text-base">No items in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {items.map((item) => (
                  <Dialog
                    key={item._id}
                    open={isDialogOpen && selectedItem?._id === item._id}
                    onOpenChange={(open) => {
                      if (!open) {
                        handleDialogClose()
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Card
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                        onClick={() => handleItemClick(item)}
                      >
                        <CardContent className="p-0">
                          <div className="relative group">
                            <img
                              src={item.type === "image" ? item.url : item.thumbnail || item.url}
                              alt={item.title}
                              className="w-full h-40 sm:h-48 md:h-52 object-cover transition-transform duration-300 group-hover:scale-110"
                              width={400}
                              height={300}
                            />
                            {item.type === "video" && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                  <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-1" fill="white" />
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4 text-white">
                              <h3 className="font-semibold text-sm md:text-lg mb-1 line-clamp-1">{item.title}</h3>
                              <p className="text-xs md:text-sm text-white/90 line-clamp-2">{item.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden">
                      <div className="relative h-full flex flex-col">
                        {/* Close button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 z-50 rounded-full bg-black/40 hover:bg-black/60 text-white h-8 w-8 md:h-10 md:w-10"
                          onClick={handleDialogClose}
                        >
                          <X className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>

                        {/* Media content */}
                        <div className="flex-1 bg-black flex items-center justify-center">
                          {selectedItem?.type === "image" ? (
                            <img
                              src={selectedItem.url || "/placeholder.svg"}
                              alt={selectedItem.title}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            selectedItem && (
                              <video
                                src={selectedItem.url}
                                controls
                                autoPlay={isVideoPlaying}
                                className="max-w-full max-h-full"
                                onEnded={() => setIsVideoPlaying(false)}
                              >
                                Your browser does not support the video tag.
                              </video>
                            )
                          )}
                        </div>

                        {/* Content details */}
                        <div className="bg-white p-4 md:p-6 border-t">
                          <h3 className="font-bold text-lg md:text-xl text-bhagva-800 mb-2 line-clamp-2">
                            {selectedItem?.title}
                          </h3>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                            {selectedItem?.description}
                          </p>
                          {selectedItem?.category && (
                            <div className="mt-3">
                              <span className="inline-block bg-bhagva-100 text-bhagva-800 text-xs md:text-sm px-2 py-1 rounded-full">
                                {selectedItem.category === "events" && "Events & Celebrations"}
                                {selectedItem.category === "serviceProjects" && "Service Projects"}
                                {selectedItem.category === "volunteers" && "Our Volunteers"}
                              </span>
                            </div>
                          )}
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

      {/* Call to Action */}
      <div className="text-center mt-12 md:mt-16 px-4">
        <p className="text-gray-700 mb-6 text-sm md:text-base">
          Would you like to contribute your photos or videos to our gallery?
        </p>
        <Button
          variant="outline"
          className="border-bhagva-600 text-bhagva-700 hover:bg-bhagva-50 px-6 py-2 text-sm md:text-base"
          onClick={() => (window.location.href = "/contact")}
        >
          Contact Us
        </Button>
      </div>
    </div>
  )
